let mockData;
let currentRole = 'admin';
// Fetch the JSON file

fetch('mock.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return response.json();
  })
  .then((data) => {
    mockData = data?.folders;
    const fileTreeContainer = document.getElementById('fileTree');
    createTreeView(fileTreeContainer, data?.folders);
  })
  .catch((error) => {
    console.error('There was a problem fetching the data:', error);
  });

// Tree list creating

function createTreeView(container, items) {
  if (container.nodeType !== Node.ELEMENT_NODE || items?.length === 0) {
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.id = item.id;
    const span = document.createElement('span');
    span.textContent = item.name;
    span.appendChild(createControlPanel(item));
    li.appendChild(span);

    if (item.folders.length > 0 || item.files.length > 0) {
      const subList = document.createElement('ul');
      subList.classList.add('nested');
      li.appendChild(subList);

      span.classList.add('caret');
      span.addEventListener('click', () => {
        span.parentElement.querySelector('.nested').classList.toggle('active');
        span.classList.toggle('caret-down');
      });

      createTreeView(subList, item.folders);
      item.files.forEach((file) => {
        const fileNode = document.createElement('li');
        fileNode.textContent = file.name;
        fileNode.id = file.id;
        fileNode.appendChild(createControlPanel(file, true))
        subList.appendChild(fileNode);
      });
    } else {
      span.classList.add('no-subitems');
    }

    container.appendChild(li);
  });
}

// Search by name functionality

document.getElementById('search-button').addEventListener('click', () => {
  const request = document.getElementById('search-panel').value;
  if (request === '') {
    return;
  }
  const searchResult = searchByName(request, mockData);
  const resultList = document.createElement('ul')
  resultList.innerHTML = searchResult.map(result => `<li>${String(result.name)}</li>`).join('');
  const resultPanel = document.getElementById('search-result');
  resultPanel.innerHTML = null;
  document.getElementsByClassName('result-container')[0].classList.remove('hidden');
  resultPanel.append(searchResult.length ? resultList : 'NOT FOUND');
});

function searchByName(inputString, data) {
  const result = [];

  function searchInFolders(folders) {
    folders.forEach((folder) => {
      if (folder.name.toLowerCase().includes(inputString.toLowerCase())) {
        result.push(folder);
      }
      if (folder.folders.length > 0) {
        searchInFolders(folder.folders);
      }
      folder.files.forEach((file) => {
        if (file.name.toLowerCase().includes(inputString.toLowerCase())) {
          result.push(file);
        }
      });
    });
  }
  searchInFolders(data);

  return result;
}

document.getElementById('close-btn').addEventListener('click', function () {
  this.parentElement.classList.add('hidden')
})

// Users select functionality

document.getElementById('user-name').addEventListener('change', function() {
  currentRole = this.value;
  const fileTreeContainer = document.getElementById('fileTree');
  fileTreeContainer.innerHTML = null;
  createTreeView(fileTreeContainer, mockData);
})

// Move/delete functionality

function createControlPanel(element, isFile) {
  const controlPanel = document.createElement('span');
  const isAccess = element.permissions.read.includes(currentRole) || currentRole === 'admin';

  const accessIcon = document.createElement('span');
  if (isFile) {
    accessIcon.textContent = isAccess  ? '🔓' : '🔒';
    controlPanel.appendChild(accessIcon);
  }

  const movePanel = document.createElement('span');
  movePanel.innerHTML = `<button>↑</button><button>↓</button>`;

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'X';
  deleteButton.disabled = !isAccess;
  deleteButton.addEventListener('click', function() {
    deleteElement(this.parentElement.parentElement, element.id);
  })
  controlPanel.appendChild(deleteButton)
  return controlPanel;
}

function deleteElement(element, elementID){
  element.tagName === 'LI' ? element.remove() : element.parentElement.remove();
  deleteElementById(mockData, elementID)
}

function deleteElementById(arr, idToDelete) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === idToDelete) {
      arr.splice(i, 1);
      return true;
    }
    if (arr[i].folders && arr[i].folders.length > 0) {
      const deletedFolder = deleteElementById(arr[i].folders, idToDelete);
      if (deletedFolder) return true;
    }
    if (arr[i].files && arr[i].files.length > 0) {
      const deletedFileIndex = arr[i].files.findIndex(file => file.id === idToDelete);
      if (deletedFileIndex !== -1) {
        arr[i].files.splice(deletedFileIndex, 1);
        return true;
      }
    }
  }
  return false;
}

// Search by name test case:
const testData = [
  {
    "id": 1,
    "name": "Folder 1",
    "folders": [
      {
        "id": 11,
        "name": "Subfolder 1.1",
        "folders": [],
        "files": [
          {
            "id": 111,
            "name": "File 1.txt"
          },
          {
            "id": 112,
            "name": "File 2.jpg"
          }
        ]
      },
      {
        "id": 12,
        "name": "Subfolder 1.2",
        "folders": [],
        "files": [
          {
            "id": 121,
            "name": "File 3.docx"
          },
          {
            "id": 122,
            "name": "File 4.pdf"
          }
        ]
      }
    ],
    "files": [
      {
        "id": 101,
        "name": "File 5.txt"
      },
      {
        "id": 102,
        "name": "File 6.jpg"
      }
    ]
  }
];

const searchString = "File";
const expectedResult = [
  {
    "id": 111,
    "name": "File 1.txt"
  },
  {
    "id": 112,
    "name": "File 2.jpg"
  },
  {
    "id": 121,
    "name": "File 3.docx"
  },
  {
    "id": 122,
    "name": "File 4.pdf"
  },
  {
    "id": 101,
    "name": "File 5.txt"
  },
  {
    "id": 102,
    "name": "File 6.jpg"
  }
];

const searchResult = searchByName(searchString, testData);

console.log("Expected result:");
console.log(expectedResult);

console.log("Result:");
console.log(searchResult);

const testPassed = JSON.stringify(searchResult) === JSON.stringify(expectedResult);
console.log("Completed test:", testPassed);

// js based on https://oss.sheetjs.com/sheetjs/
let pastData = [];
let pastKeyColumn = 0;
let currentData = [];
let currentKeyColumn = 0;

document.getElementById('start').addEventListener('click', makeItHappen);

function handleFiles(files, listType) {
  const reader = new FileReader();
  reader.readAsBinaryString(files[0]);
  reader.onload = function (file) {
    const data = file.target.result;
    if(listType === 'past') {
      pastData = makeItJson(data);
      generatePastUi(pastData);
    } else {
      currentData = makeItJson(data);
      generateCurrentUi(currentData)
    }
  }
}

function generatePastUi(data) {
  const columnsLength = data[0].length;
  const list = document.getElementById('columns');
  const select = document.createElement('select');
  select.setAttribute('id', 'pastKeyColumn');

  for(let i=0; i<columnsLength; i++) {
    let li = document.createElement('li');
    li.innerHTML = `<input type="checkbox" id="` + i + `" value="` + i + `" /><label for="` + i + `">` +(i+1) + `</label>`;
    list.appendChild(li);

    let option = document.createElement('option');
    option.value = i;
    option.text = i + 1;
    select.appendChild(option);
  }

  document.getElementById('pastKey').appendChild(select);
}

function generateCurrentUi(data) {
  const columnsLength = data[0].length;
  const select = document.createElement('select');
  select.setAttribute('id', 'currentKeyColumn');

  for(let i=0; i<columnsLength; i++) {
    let option = document.createElement('option');
    option.value = i;
    option.text = i + 1;
    select.appendChild(option);
  }

  document.getElementById('currentKey').appendChild(select);
}

function makeItHappen() {
  const startTime = Date.now();
  console.log('here we go...');

  currentKeyColumn = document.getElementById('currentKeyColumn').value;

  let migrateTheseColumns = [];
  document.querySelectorAll('#columns input').forEach(c => {
    if (c.checked) {
      migrateTheseColumns.push(c.value);
    }
  })

  const map = arrayToMap(pastData);

  currentData.forEach((row, index, array) => {
    let pastRow = map[row[currentKeyColumn]];

    if(index%1000 == 0) {
      console.log(index);
    }
    if (pastRow !== undefined) {
      migrateTheseColumns.forEach( c => {
        row.push(pastRow[c]);
      });
    } else {
      array[index] = row.concat('N/A');
    }
  });

  console.log('clear pastData');
  pastData = null; // prevent out of memory
  console.log('create sheet');
  sheet = XLSX.utils.json_to_sheet(currentData, {skipHeader: true});
  console.log('clear currentData');
  currentData = null; // prevent out of memory
  console.log('create book');
  book = XLSX.utils.book_new();
  console.log('book_append_sheet');
  XLSX.utils.book_append_sheet(book, sheet, 'Output');
  console.log('clear sheet');
  sheet = null;
  console.log('write book');
  XLSX.writeFile(book, 'gata.csv', { bookType: 'csv' });

  console.log('Done', Date.now() - startTime);
}

function makeItJson(data) {
  const file = XLSX.read(data, {type: 'binary'})
  const sheet = XLSX.utils.sheet_to_json(
    file.Sheets[file.SheetNames[0]],
    {
      header: 1 // this avoinds makeing the first row as keys
    }
  )
  return sheet;
}

function arrayToMap(a) {
  let map = {};

  pastKeyColumn = document.getElementById('pastKeyColumn').value;

  a.forEach(el => {
    map[el[pastKeyColumn]] = el;
  });

  return map;
}
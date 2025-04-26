let notes = JSON.parse(localStorage.getItem('notes')) || [];
let folders = JSON.parse(localStorage.getItem('folders')) || [];
let currentFolder = null;
let currentNote = null;

const folderList = document.getElementById('folderList');
const notesList = document.getElementById('notesList');
const editorSection = document.getElementById('editorSection');
const editor = document.getElementById('editor');
const noteTitle = document.getElementById('noteTitle');
const counter = document.getElementById('counter');
const reminderInput = document.createElement('input');

// تفعيل الثيم
document.getElementById('toggleTheme').onclick = () => {
  document.body.classList.toggle('dark-theme');
};

// البحث
document.getElementById('searchInput').addEventListener('input', e => {
  renderNotes(e.target.value);
});

// إضافة مجلد
document.getElementById('addFolderBtn').onclick = () => {
  const name = prompt('اسم المجلد الجديد:');
  if (name) {
    folders.push(name);
    saveFolders();
    renderFolders();
  }
};

// إضافة ملاحظة جديدة
document.getElementById('addNoteBtn').onclick = () => {
  currentNote = null;
  noteTitle.value = '';
  editor.innerHTML = '';
  editorSection.classList.remove('hidden');
  notesList.style.display = 'none';
};

// حفظ ملاحظة
document.getElementById('saveNoteBtn').onclick = () => {
  if (!noteTitle.value.trim()) {
    alert('اكتب عنوان للملاحظة!');
    return;
  }
  const content = editor.innerHTML.trim();
  if (!content) {
    alert('اكتب بعض المحتوى للملاحظة!');
    return;
  }
  if (currentNote) {
    currentNote.title = noteTitle.value;
    currentNote.content = content;
  } else {
    notes.push({
      id: Date.now(),
      title: noteTitle.value,
      content,
      folder: currentFolder,
      reminder: reminderInput.value || null,
    });
  }
  saveNotes();
  editorSection.classList.add('hidden');
  notesList.style.display = 'grid';
  renderNotes();
};

// تفعيل التذكير
document.getElementById('setReminderBtn').onclick = () => {
  reminderInput.type = "datetime-local";
  reminderInput.style.display = "inline-block";
  editorSection.appendChild(reminderInput);
};

// العودة
document.getElementById('backBtn').onclick = () => {
  editorSection.classList.add('hidden');
  notesList.style.display = 'grid';
};

// تصدير الملاحظة
document.getElementById('exportNoteBtn').onclick = () => {
  const blob = new Blob([editor.innerText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${noteTitle.value || 'ملاحظة'}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

// عداد الكلمات
editor.addEventListener('input', () => {
  const text = editor.innerText.trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  counter.textContent = `كلمات: ${words} | حروف: ${chars}`;
});

// رفع صورة
function uploadImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement('img');
      img.src = reader.result;
      editor.appendChild(img);
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// عرض المجلدات
function renderFolders() {
  folderList.innerHTML = '';
  const all = document.createElement('li');
  all.textContent = '📁 الكل';
  all.onclick = () => { currentFolder = null; renderNotes(); };
  folderList.appendChild(all);

  folders.forEach(folder => {
    const li = document.createElement('li');
    li.textContent = `📂 ${folder}`;
    li.onclick = () => { currentFolder = folder; renderNotes(); };
    folderList.appendChild(li);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑️ حذف';
    deleteButton.onclick = () => deleteFolder(folder);
    li.appendChild(deleteButton);
  });
}

// عرض الملاحظات
function renderNotes(search = '') {
  notesList.innerHTML = '';
  const filtered = notes.filter(note => 
    (!currentFolder || note.folder === currentFolder) &&
    (note.title.includes(search) || note.content.includes(search))
  );
  filtered.forEach(note => {
    const noteCard = document.createElement('div');
    noteCard.classList.add('note-card');
    noteCard.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content.slice(0, 100)}...</p>
    `;
    noteCard.onclick = () => editNote(note);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑️ حذف';
    deleteButton.onclick = () => deleteNote(note.id);
    noteCard.appendChild(deleteButton);
    notesList.appendChild(noteCard);
  });
}

// تعديل ملاحظة
function editNote(note) {
  currentNote = note;
  noteTitle.value = note.title;
  editor.innerHTML = note.content;
  editorSection.classList.remove('hidden');
  notesList.style.display = 'none';
}

// حذف ملاحظة
function deleteNote(noteId) {
  notes = notes.filter(note => note.id !== noteId);
  saveNotes();
  renderNotes();
}

// حذف مجلد
function deleteFolder(folderName) {
  folders = folders.filter(folder => folder !== folderName);
  notes = notes.filter(note => note.folder !== folderName); // إزالة الملاحظات المرتبطة بالمجلد
  saveFolders();
  renderFolders();
  renderNotes();
}

// حفظ الملاحظات في localStorage
function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// حفظ المجلدات في localStorage
function saveFolders() {
  localStorage.setItem('folders', JSON.stringify(folders));
}

renderFolders();
renderNotes();
/***************************************************/

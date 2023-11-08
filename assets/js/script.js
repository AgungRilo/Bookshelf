
const Name = {
    editBookYear: 'inputEditBookYear',
    editBookWriter: 'inputEditBookWriter',
    editBookTitle: 'inputEditBookTitle',
    editBookFinish: 'inputEditCheckFinish'
}

let state = {
    selectedId: null,
    editForm: {
        [Name.editBookTitle]: '',
        [Name.editBookWriter]: '',
        [Name.editBookYear]: null
    }
}

const BOOKSHELF_DATA = "BOOKSHELF_LOCAL_STORAGE";

const EVENT = {
    SEARCH_UNFINISHED_EVENT: "SEARCH_UNFINISHED_EVENT",
    SEARCH_FINISHED_EVENT: "SEARCH_FINISHED_EVENT",
    RENDER_EVENT: "RENDER_EVENT",
}

const renderEvent = new Event(EVENT.RENDER_EVENT);
const searchUnFinishedEvent = new Event(EVENT.SEARCH_UNFINISHED_EVENT);
const searchFinishedEvent = new Event(EVENT.SEARCH_FINISHED_EVENT);

let bookshelf = [];

document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.querySelector('#add-form');
    const editForm = document.querySelector('#edit-form');
    const listUnfinishedReading = document.querySelector('#listUnfinishedReading');
    const listFinishedReading = document.querySelector('#listFinishedReading');
    const inputBookTitle = document.querySelector('#inputBookTitle');
    const inputBookWriter = document.querySelector('#inputBookWriter');
    const inputBookYear = document.querySelector('#inputBookYear');
    const inputCheckFinish = document.querySelector('#inputCheckFinish');

    const inputEditBookTitle = document.querySelector(`#${Name.editBookTitle}`);
    const inputEditBookWriter = document.querySelector(`#${Name.editBookWriter}`);
    const inputEditBookYear = document.querySelector(`#${Name.editBookYear}`);
    const inputEditBookCheckFinish = document.querySelector(`#${Name.editBookFinish}`);
    const modalEdit = document.querySelector('#modal-edit');
    const searchUnfinished = document.querySelector('#searchUnfinished');
    const btnSearchUnfinished = document.querySelector('#btnSearchUnfinished');
    const searchFinished = document.querySelector('#searchFinished');
    const btnSearchFinished = document.querySelector('#btnSearchFinished');
    const btnCloseEditModal = document.querySelector('#btnCloseModalEdit');
    const btnSubmitNewBook = document.querySelector('#btnSubmitNewBook');

    addForm.addEventListener('submit', (event) => {
        event.preventDefault();

        addNewBook({
            title: inputBookTitle.value,
            author: inputBookWriter.value,
            year: Number(inputBookYear.value),
            isComplete: inputCheckFinish.checked
        });

        inputBookTitle.value = '';
        inputBookWriter.value = '';
        inputBookYear.value = '';
        inputCheckFinish.checked = false;
    });

    editForm.addEventListener('submit', (event) => {
        event.preventDefault();

        updateBook({
            id: state.selectedId,
            title: state.editForm[Name.editBookTitle],
            author: state.editForm[Name.editBookWriter],
            year: state.editForm[Name.editBookYear],
            isComplete: state.editForm[Name.editBookFinish]
        });
    });

    modalEdit.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            handleCloseAllModal();
        }
    });

    document.addEventListener(EVENT.RENDER_EVENT, () => {
        listFinishedReading.innerHTML = '';
        listUnfinishedReading.innerHTML = '';

        for (const book of bookshelf) {
            const bookArticle = bookArticleTemplate({
                id: book.id,
                title: book.title,
                author: book.author,
                year: book.year,
                isComplete: book.isComplete
            });

            if (!book.isComplete) {
                listUnfinishedReading.innerHTML += bookArticle;
            } else {
                listFinishedReading.innerHTML += bookArticle;
            }
        }
    });

    document.addEventListener(EVENT.SEARCH_UNFINISHED_EVENT, () => {
        listUnfinishedReading.innerHTML = bookshelf.filter((book) =>
            book.title.toLowerCase().includes(searchUnfinished.value.toLowerCase()) && !book.isComplete
        ).map((book) => bookArticleTemplate({ ...book })).join('');
    });

    document.addEventListener(EVENT.SEARCH_FINISHED_EVENT, () => {
        listFinishedReading.innerHTML = bookshelf.filter((book) =>
            book.title.toLowerCase().includes(searchFinished.value.toLowerCase()) && book.isComplete
        ).map((book) => bookArticleTemplate({ ...book })).join('');
    });

    btnSearchUnfinished.addEventListener('click', () => {
        document.dispatchEvent(searchUnFinishedEvent);
    });

    btnSearchFinished.addEventListener('click', () => {
        document.dispatchEvent(searchFinishedEvent);
    });

    inputCheckFinish.addEventListener('click', (event) => {
        if (event.currentTarget.checked) {
            btnSubmitNewBook.innerHTML = "Add New Book To Finished";
        } else {
            btnSubmitNewBook.innerHTML = "Add New Book To Unfinished";
        }
    })

    listUnfinishedReading.addEventListener('click', handleClickOnListEventListener);
    listFinishedReading.addEventListener('click', handleClickOnListEventListener);
    inputEditBookTitle.addEventListener('keyup', handleOnChangeEditEventListener);
    inputEditBookWriter.addEventListener('keyup', handleOnChangeEditEventListener);
    inputEditBookYear.addEventListener('keyup', handleOnChangeEditEventListener);
    inputEditBookCheckFinish.addEventListener('change', handleOnChangeEditCheckListener);
    btnCloseEditModal.addEventListener('click', handleCloseAllModal);

    loadLocalStorage();
});

const handleClickOnListEventListener = (event) => {
    const isActionButton = event.target.classList.contains('button');
    if (isActionButton) {
        const actionFinish = event.target.classList.contains('finish');
        const actionRepeat = event.target.classList.contains('repeat');
        const actionDelete = event.target.classList.contains('delete');
        const actionEdit = event.target.classList.contains('edit');
        const parentElement = event.target.parentElement;
        const articleId = parentElement.getAttribute("data-id");

        if (actionFinish) addBookToFinished(articleId);
        if (actionRepeat) addBookToUnfinished(articleId);
        if (actionDelete) deleteBook(articleId);
        if (actionEdit) handleOpenEditModal(articleId);
    }
}

const handleOpenEditModal = (bookId) => {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex < 0) return;
    const book = bookshelf[bookIndex];

    const modalEdit = document.querySelector('#modal-edit');
    const inputEditBookTitle = document.querySelector(`#${Name.editBookTitle}`);
    const inputEditBookWriter = document.querySelector(`#${Name.editBookWriter}`);
    const inputEditBookYear = document.querySelector(`#${Name.editBookYear}`);
    const inputEditBookCheckFinish = document.querySelector(`#${Name.editBookFinish}`);

    inputEditBookTitle.value = book.title;
    inputEditBookWriter.value = book.author;
    inputEditBookYear.value = book.year;
    inputEditBookCheckFinish.checked = book.isComplete;

    if (modalEdit.classList.contains('close')) modalEdit.classList.remove('close');
    modalEdit.classList.add("open");

    state = {
        ...state,
        selectedId: bookId,
        editForm: {
            ...state.editForm,
            [Name.editBookTitle]: book.title,
            [Name.editBookWriter]: book.author,
            [Name.editBookYear]: book.year,
            [Name.editBookFinish]: book.isComplete
        },
    }
}

const handleCloseAllModal = () => {
    const modalEdit = document.querySelector('#modal-edit');

    if (modalEdit.classList.contains('open')) modalEdit.classList.remove('open');
    modalEdit.classList.add("close");
}

const handleOnChangeEditEventListener = (event) => {
    state = {
        ...state,
        editForm: {
            ...state.editForm,
            [event.target.name]: event.target.value
        }
    }
}

const handleOnChangeEditCheckListener = (event) => {
    state = {
        ...state,
        editForm: {
            ...state.editForm,
            [event.target.name]: event.target.checked
        }
    }
}

const generatedId = () => +new Date();

const isStorageExist = () => {
    if (typeof (Storage) === undefined) {
        alert("Browser not support local storage, please use Chrome or Firefox");
        return false;
    }
    return true;
}

const syncRender = () => {
    document.dispatchEvent(renderEvent);
    syncLocalStorage();
}

const syncLocalStorage = () => {
    if (isStorageExist()) {
        localStorage.setItem(BOOKSHELF_DATA, JSON.stringify(bookshelf));
    }
}

const loadLocalStorage = () => {
    if (isStorageExist()) {
        const serializedLocalStorageData = localStorage.getItem(BOOKSHELF_DATA);
        if (serializedLocalStorageData) {
            const data = JSON.parse(serializedLocalStorageData);
            bookshelf = data && data instanceof Array ? data : [];
            syncRender();
        }
    }
}

const findBookIndex = (bookId) => bookshelf.findIndex((book) => book.id === Number(bookId));

const addNewBook = ({ title, author, year, isComplete }) => {
    bookshelf.push({
        id: generatedId(),
        title,
        author,
        year,
        isComplete
    });
    syncRender();
}

const updateBook = ({ id, title, author, year, isComplete }) => {
    const bookIndex = findBookIndex(id);

    if (bookIndex < 0) return;
    bookshelf[bookIndex] = { id: Number(id), title, author, year, isComplete };
    syncRender();
    handleCloseAllModal();
}

const addBookToFinished = (id) => {
    const bookIndex = findBookIndex(id);

    if (bookIndex < 0) return;
    bookshelf[bookIndex].isComplete = true;
    syncRender();
}

const addBookToUnfinished = (id) => {
    const bookIndex = findBookIndex(id);

    if (bookIndex < 0) return;
    bookshelf[bookIndex].isComplete = false;
    syncRender();
}

const deleteBook = (bookId) => {
    bookshelf = bookshelf.filter((book) => book.id !== Number(bookId));
    syncRender();
}

const bookArticleTemplate = ({ id, title, author, year, isComplete }) => {
    return `
    <article class="wrapper__article" id=${id}>
        <div class="article__title">
            <h1>${title}</h1>
            <p>${author}</p>
            <p>Year ${year}</p>
        </div>
        <div class="article__action" data-id=${id}>
            <button class="button button--danger delete">Delete</button>
            <button class="button button--warning edit">Edit</button>
            <button class="button ${!isComplete ? 'button--primary finish' : 'button--secondary repeat'}">${!isComplete ? 'Finish' : 'Repeat'}</button>
        </div>
    </article>
    `;
}
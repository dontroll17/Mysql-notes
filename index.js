const { readFile, writeFile } = require('fs/promises');
const [command, title, content] = process.argv.slice(2);

const parser = (data) => {
    return JSON.parse(data);
} 

const create = async (title, content) => {
    try {
        const data = await readFile('notes.json');
        const notes = parser(data);
        notes.push({ title, content });
        const notesToJson = JSON.stringify(notes);
        await writeFile('notes.json', notesToJson);
        console.log('notes created');
    }
    catch(e) {
        console.error(e);
    }
}

const list = async () => {
    const data = await readFile('notes.json');
    const notes = parser(data);
    if(notes.length < 1) {
        console.log('No notes');
    }
    else {
        for(const note of notes) {
            console.log(note);
        }
    }
}

const view = async (title) => {
    const data = await readFile('notes.json');
    const notes = parser(data);
    const note = notes.find( note => note.title === title);
    if(!note) {
        console.log('Not found');
    }
    else {
        console.log(note.content);
    }
}

const remove = async (title) => {
    const data = await readFile('notes.json');
    let notes = parser(data);
    notes = notes.filter(note => note.title !== title);
    const json = JSON.stringify(notes);
    await writeFile('notes.json', json);
    console.log('note delete');
}

switch(command) {
    case 'list':
        list();
        break;
    case 'view':
        view(title);
        break;
    case 'create':
        create(title, content);
        break;
    case 'remove':
        remove(title);
        break;
    default: console.log('unknown command');
}

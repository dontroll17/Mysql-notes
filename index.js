const { readFile, writeFile } = require('fs/promises');
const [command, title, content] = process.argv.slice(2);
const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./config/mysql');

const sequelize = new Sequelize(config.database, config.username, config.password, {
    dialect: config.dialect
});

const notes = sequelize.define('note', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: false
});

const syncDb = async() => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Got connect and sync');
    }
    catch(e) {
        console.error(e);
    }
}

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

const help = () => {
	console.log('list - list all\n'
		+ 'remove + title - remove note\n'
		+ 'create + title + ctx - create note\n'
		+ 'view + title - view note\n');
}

switch(command) {
    case 'sync':
        syncDb();
        break;
	case 'help':
		help();
		break;
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

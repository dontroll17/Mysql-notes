const { readFile, writeFile } = require('fs/promises');
const { createInterface } = require('readline');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config/mysql');

const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

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

function completer(line) {
    return line.trim().split(' ');
  }

const create = async (title, content) => {
    try {
        await notes.create( { title: title, content: content } );
        console.log('notes created');
    }
    catch(e) {
        console.error(e);
    }
}

const list = async () => {
    const data = await notes.findAll({
        raw: true
    });
    if(data.length < 1) {
        console.log('No notes');
    }
    else {
        console.log(data);
    }
    
}

const view = async (title) => {
    const data = await notes.findAll({
        raw: true,
        where: {
            title: title
        }
    });
    if(!data) {
        console.log('Not found');
    }
    else {
        console.log(data);
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
		+ 'view + title - view note\n'
        + 'sync - sync database\n'
        + 'exit - exit process');
}

const exit = async() => {
    await sequelize. close();
    console.log('connection close, goodbye =3');
    process.exit(1);
}

readline.on('line', line => {
    const [command, title, content] = completer(line);
    switch(command) {
        case 'exit':
            exit();
            break;
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
});
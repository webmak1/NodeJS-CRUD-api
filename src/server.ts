import { createServer } from 'http';
import { resolve } from 'path';
import * as uuid from 'uuid';
import process from 'process';
import dotenv from 'dotenv';

dotenv.config({path: resolve((process.cwd(), '.env'))});

const PORT = process.env.PORT || 4000;
const pid = process.pid;

interface IUser {
	id: uuid.V4Options;
	username: string;
	age: number;
    hobbies: string[] | [];
}

let users:IUser[] = [];

const getUsers = async () => {
    try {
        return Promise.resolve(users);
    } catch(error) {
        console.log(error);
    }
};

const getUser = async (id:string) => {
    try {
        const user = users.find((user:IUser) => user.id === id);
        return Promise.resolve(user);
    } catch(error) {
        console.log(error);
    }
};

const addUser = async (data:string) => {
    const newUser = {
      id: uuid.v4(),
      ...JSON.parse(data)
    }

    users.push(newUser);
    try {
        return Promise.resolve(newUser);
    } catch (error) {
        console.log(error);
    }
};

const updateUser = async (id:string, data:string) => {
    const userIndex = users.findIndex((user:IUser) => user.id === id);

    if (userIndex >= 0) {
        users[userIndex] = {...users[userIndex], ...JSON.parse(data)};
        try {
            return Promise.resolve(users[userIndex]);
        } catch(error) {
            console.log(error);
        }
    }
}

const deleteUser = async (id:string) => {
    users = users.filter((user:IUser) => user.id !== id);
}

export const server = createServer(async (req, res) => {
    if (req.url) {
        switch (req.method) {
            case 'POST': {
                if (req.url === '/api/users' || req.url === '/api/users/') {
                    req.on('data', async (data) => {
                        const userProperties = JSON.parse(data.toString());
                        let message = '';
                        if (!userProperties.username) {
                            message += 'username ';
                        }
                        if (!userProperties.age) {
                            message += 'age ';
                        }
                        if (!userProperties.hobbies) {
                            message += 'hobbies ';
                        }
                        if (userProperties.username && userProperties.age && userProperties.hobbies) {
                            const newUser = await addUser(data.toString());
                            res.writeHead(201, { 'Content-Type': 'application/json', 'Process-id': pid});
                            res.end(JSON.stringify(newUser));
                        } else {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({message: `Enter the ${message}field(s)`}));
                        }
                    });
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({message: 'This is not correct url'}));
                }
                break;
            }
            case 'GET': {
                if (req.url === '/api/users' || req.url === '/api/users/') {
                    const users = await getUsers();
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Process-id': pid});
                    res.end(JSON.stringify(users));
                } else if (req.url.startsWith('/api/users/') && req.url.match(/\/api\/users\/[\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12}/)) {
                    const id = req.url.split('/')[3];
                    const user = await getUser(id);
                    if (user) {
                        res.writeHead(200, { 'Content-Type': 'application/json', 'Process-id': pid});
                        res.end(JSON.stringify(user));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({message: "User not found"}));
                    }
                } else if (req.url.startsWith('/api/users/') && !req.url.match(/\/api\/users\/[\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12}/)){
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({message: "Users id is invalid"}));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({message: 'This is not correct url'}));
                }
                break;
            }
            case 'PUT': {
                if (req.url.startsWith('/api/users/') && req.url.match(/\/api\/users\/[\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12}/)) {
                    const id = req.url.split('/')[3];

                    req.on('data', async (data) => {
                        const userProperties = JSON.parse(data.toString());
                        let message = '';
                        if (!userProperties.username) {
                            message += 'username ';
                        }
                        if (!userProperties.age) {
                            message += 'age ';
                        }
                        if (!userProperties.hobbies) {
                            message += 'hobbies ';
                        }
                        if (userProperties.username && userProperties.age && userProperties.hobbies) {
                            const user = await updateUser(id, data.toString());
                            if (user) {
                                res.writeHead(200, { 'Content-Type': 'application/json', 'Process-id': pid});
                                res.end(JSON.stringify(user));
                            } else {
                                res.writeHead(404, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({message: "User not found"}));
                            }
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({message: `Enter the ${message}field(s)`}));
                        }
                    });
                } else if (req.url.startsWith('/api/users/') && !req.url.match(/\/api\/users\/[\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12}/)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({message: "Users id is invalid"}));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({message: 'This is not correct url'}));
                }
                break;
            }
            case 'DELETE': {
                if (req.url.startsWith('/api/users/') && req.url.match(/\/api\/users\/[\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12}/)) {
                    const id = req.url.split('/')[3];
                    const user = users.find((user:IUser) => user.id === id);

                    if (user) {
                        await deleteUser(id);
                        res.writeHead(204, { 'Content-Type': 'application/json', 'Process-id': pid});
                        res.end(JSON.stringify({message: "User was deleted"}));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({message: "User not found"}));
                    }
                } else if (req.url.startsWith('/api/users/') && !req.url.match(/\/api\/users\/[\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12}/)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({message: "Users id is invalid"}));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({message: 'This is not correct url'}));
                }
                break;
            }
            default: {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({message: 'Use only GET, POST, PUT or DELETE method'}));
            }
        }
    }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('uncaughtException', () => {
    server.close();
});

process.on('SIGTERM', () => {
    server.close();
});

process.once('exit', () => process.exit(0));
process.once('SIGINT', () => process.exit(0));
process.once('SIGTERM', () => process.exit(0));
process.on('message', message => {
    if (message === 'shutdown') {
        process.exit(0);
    }
});

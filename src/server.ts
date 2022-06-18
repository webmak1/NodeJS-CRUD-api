import { createServer } from 'http';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { writeFile, readFile } from 'fs/promises';
import * as uuid from 'uuid';

interface IUser {
	id: uuid.V4Options;
	username: string;
	age: number;
    hobbies: string[] | [];
}

const getUsers = async () => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const path = resolve(__filename, '../usersData/users.json');
        const usersJSON = (await readFile(path)).toString();
        return JSON.parse(usersJSON);
    } catch(error) {
        console.log(error);
    }
};

const getUser = async (id:string) => {
    try {
        const users:IUser[] = await getUsers();
        const user = users.find((user:IUser) => user.id === id);
        return Promise.resolve(user);
    } catch(error) {
        console.log(error);
    }
};

const addUser = async (data:string) => {
    const __filename = fileURLToPath(import.meta.url);
    const path = resolve(__filename, '../usersData/users.json');
    const users:IUser[] = await getUsers();
    const newUser = {
      id: uuid.v4(),
      ...JSON.parse(data)
    }

    users.push(newUser);
    try {
        await writeFile(path, JSON.stringify(users));
        return newUser;
    } catch (error) {
        console.log(error);
    }
};

const updateUser = async (id:string, data:string) => {
    const __filename = fileURLToPath(import.meta.url);
    const path = resolve(__filename, '../usersData/users.json');
    const users:IUser[] = await getUsers();
    const userIndex = users.findIndex((user:IUser) => user.id === id);

    if (userIndex >= 0) {
        users[userIndex] = {...users[userIndex], ...JSON.parse(data)};
        try {
            await writeFile(path, JSON.stringify(users));
            return users[userIndex];
        } catch(error) {
            console.log(error);
        }
    }
}

const deleteUser = async (id:string) => {
  const __filename = fileURLToPath(import.meta.url);
  const path = resolve(__filename, '../usersData/users.json');
  const users:IUser[] = await getUsers();
  const newUsers = users.filter((user:IUser) => user.id !== id);

  try {
      await writeFile(path, JSON.stringify(newUsers));
  } catch(error) {
      console.log(error);
  }
}

const server = createServer(async (req, res) => {
    if (req.url) {
        switch (req.method) {
            case 'POST': {
                if (req.url === '/api/users') {
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
                            res.writeHead(201, { 'Content-Type': 'application/json' })
                            res.end(JSON.stringify(newUser));
                        } else {
                            res.writeHead(400, { 'Content-Type': 'application/json' })
                            res.end(JSON.stringify({message: `Enter the ${message}field(s)`}));
                        }
                    });
                }
                break;
            }
            case 'GET': {
                if (req.url === '/api/users') {
                    const users = await getUsers();
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify(users));
                } else if (req.url.match(/\/api\/users\/[\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12}/)) {
                    const id = req.url.split('/')[3];
                    const user = await getUser(id);
                    if (user) {
                        res.writeHead(200, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify(user));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify({message: "User not found"}));
                    }
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({message: "Users id is invalid"}));
                }
                break;
            }
            case 'PUT': {
                if (req.url.match(/\/api\/users\/[\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12}/)) {
                    const id = req.url.split('/')[3];

                    req.on('data', async (data) => {
                        const user = await updateUser(id, data.toString());

                        if (user) {
                            res.writeHead(200, { 'Content-Type': 'application/json' })
                            res.end(JSON.stringify(user));
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' })
                            res.end(JSON.stringify({message: "User not found"}));
                        }
                    });
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({message: "Users id is invalid"}));
                }
                break;
            }
            case 'DELETE': {
                if (req.url.match(/\/api\/users\/[\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12}/)) {
                    const id = req.url.split('/')[3];
                    const users:IUser[] = await getUsers();
                    const user = users.find((user:IUser) => user.id === id);

                    if (user) {
                        await deleteUser(id);
                        res.writeHead(204, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify(user));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify({message: "User not found"}));
                    }
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({message: "Users id is invalid"}));
                }
                break;
            }
        }
    }
});

server.listen(4000, () => console.log('Server running on port 4000'));


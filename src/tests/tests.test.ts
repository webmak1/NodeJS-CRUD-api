import { server } from "../server";
import { agent as request } from "supertest";
import process from 'process';
import { resolve } from 'path';
import dotenv from 'dotenv';
import * as uuid from 'uuid';

dotenv.config({path: resolve((process.cwd(), '.env'))});

describe("A simple api endpoint", () => {
    let id='';
    it("Scenario-1: get all users", (done) => {
        request(server).get("/api/users").end((err, res) => {
            expect(res.text).toEqual("[]");
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("Scenario-1: create user and get this user", (done) => {
        request(server).post("/api/users").send({"username":"USER","age":45,"hobbies":[]}).end((err, res) => {
            expect(JSON.parse(res.text).age).toEqual(45);
            expect(JSON.parse(res.text).username).toEqual('USER');
            expect(res.statusCode).toEqual(201);

            id = JSON.parse(res.text).id;
            
            request(server).get(`/api/users/${id}`).end((err, res) => {
                expect(JSON.parse(res.text).age).toEqual(45);
                expect(JSON.parse(res.text).username).toEqual('USER');
                expect(JSON.parse(res.text).id).toEqual(id);  
                expect(res.statusCode).toEqual(200);
            });
            done();
        });
    });

    it("Scenario-1: update this user", (done) => {
        request(server).put(`/api/users/${id}`).send({"username":"NAME","age":26,"hobbies":["fish"]}).end((err, res) => {
            expect(JSON.parse(res.text).age).toEqual(26);
            expect(JSON.parse(res.text).username).toEqual('NAME');
            expect(JSON.parse(res.text).id).toEqual(id);  
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("Scenario-1: delete this user", (done) => {
        request(server).delete(`/api/users/${id}`).end((err, res) => {
            expect(res.statusCode).toEqual(204);
            done();
        });
    });

    it("Scenario-1: get this user after deleting", (done) => {
        request(server).get(`/api/users/${id}`).end((err, res) => {
            expect(JSON.parse(res.text).message).toEqual("User not found");
            expect(res.statusCode).toEqual(404);
            done();
        });
    });
});

describe("A simple api endpoint2", () => {
    let id1='';
    let id2='';
    it("Scenario-2: get all users", async () => {
        const allUsersResult = await request(server).get("/api/users");
        expect(allUsersResult.text).toEqual("[]");
        expect(allUsersResult.statusCode).toEqual(200);
    });

    it("Scenario-2: create first user", async () => {
        const creatingUser1Result = await request(server).post("/api/users").send({"username":"USER1","age":25,"hobbies":["fish"]});
        expect(JSON.parse(creatingUser1Result.text).age).toEqual(25);
        expect(JSON.parse(creatingUser1Result.text).username).toEqual('USER1');
        expect(creatingUser1Result.statusCode).toEqual(201);

        id1 = JSON.parse(creatingUser1Result.text).id;
    });

    it("Scenario-2: create second user", async () => {
        const creatingUser2Result = await request(server).post("/api/users").send({"username":"USER2","age":45,"hobbies":[]});
        expect(JSON.parse(creatingUser2Result.text).age).toEqual(45);
        expect(JSON.parse(creatingUser2Result.text).username).toEqual('USER2');
        expect(creatingUser2Result.statusCode).toEqual(201);

        id2 = JSON.parse(creatingUser2Result.text).id;
    });

    it("Scenario-2: update first user", async () => {
        const updatingUser1Result = await request(server).put(`/api/users/${id1}`).send({"username":"NAME1","age":26,"hobbies":["nodeJS"]});
        expect(JSON.parse(updatingUser1Result.text).age).toEqual(26);
        expect(JSON.parse(updatingUser1Result.text).username).toEqual('NAME1');
        expect(JSON.parse(updatingUser1Result.text).id).toEqual(id1);  
        expect(updatingUser1Result.statusCode).toEqual(200);
    });

    it("Scenario-2: delete second user", async () => {
        const deletingUser2Result = await request(server).delete(`/api/users/${id2}`);    
        expect(deletingUser2Result.statusCode).toEqual(204);
    });

    it("Scenario-2: get count of users after these operations", async () => {
        const getAllUsersResult = await request(server).get(`/api/users`);
        expect(JSON.parse(getAllUsersResult.text).length).toEqual(1);
        expect(getAllUsersResult.statusCode).toEqual(200);
    });
});

describe("A simple api endpoint3", () => {
    let id3=uuid.v4();
    it("Scenario-3: try to get no existing user", async () => {
        const getUserResult = await request(server).get(`/api/users/${id3}`);
        expect(JSON.parse(getUserResult.text).message).toEqual("User not found");
        expect(getUserResult.statusCode).toEqual(404);
    });

    it("Scenario-3: create first user", async () => {
        const creatingUser1Result = await request(server).post("/api/users").send({"username":"USER1","age":25,"hobbies":["fish"]});
        expect(JSON.parse(creatingUser1Result.text).age).toEqual(25);
        expect(JSON.parse(creatingUser1Result.text).username).toEqual('USER1');
        expect(creatingUser1Result.statusCode).toEqual(201);
    });

    it("Scenario-3: create second user", async () => {
        const creatingUser2Result = await request(server).post("/api/users").send({"username":"USER2","age":45,"hobbies":[]});
        expect(JSON.parse(creatingUser2Result.text).age).toEqual(45);
        expect(JSON.parse(creatingUser2Result.text).username).toEqual('USER2');
        expect(creatingUser2Result.statusCode).toEqual(201);
    });

    it("Scenario-3: try to update no existing user", async () => {
        const updatingUserResult = await request(server).put(`/api/users/${id3}`).send({"username":"NAME1","age":26,"hobbies":["nodeJS"]});
        expect(JSON.parse(updatingUserResult.text).message).toEqual("User not found");
        expect(updatingUserResult.statusCode).toEqual(404);
    });

    it("Scenario-3: try to delete no existing user", async () => {
        const deletingUserResult = await request(server).delete(`/api/users/${id3}`);
        expect(JSON.parse(deletingUserResult.text).message).toEqual("User not found");
        expect(deletingUserResult.statusCode).toEqual(404);
    });

    it("Scenario-3: get count of users after these operations", async () => {
        const getAllUsersResult = await request(server).get(`/api/users`);
        expect(JSON.parse(getAllUsersResult.text).length).toEqual(3);
        expect(getAllUsersResult.statusCode).toEqual(200);
    });
});

require("module-alias/register")
const getMachineIp = require("@utils/getMachineIp")
const { functions } = require("@init")

const apiUrl = `http://${getMachineIp()}:${
    functions.config().bci.functions.port
}/building-cloud-integration/us-central1/bci`

const { expect } = require("chai")
const chai = require("chai")
const chaiHttp = require("chai-http")
const chaiJsonSchemaAjv = require("chai-json-schema-ajv")
chai.use(chaiHttp)
chai.use(chaiJsonSchemaAjv)

// For sending files
const path = require("path")

const fetchListingSchema = {
    type: "object",
    properties: {
        creatorId: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        manufacturer: { type: "string" },
        category: { type: "string" },
        location: { type: "string" },
        askingPrice: { type: "string" },
        shipping: { type: "boolean" },
        pickup: { type: "boolean" },
        images: { type: "string" },
        updatedAt: { type: ["object", "null"] }, // Object instead of null because listing should be updated
        createdAt: { type: "object" },
    },
    required: [
        "creatorId",
        "title",
        "description",
        "manufacturer",
        "category",
        "location",
        "askingPrice",
        "shipping",
        "pickup",
        "images",
        "updatedAt",
        "createdAt",
    ],
}

//
// Test data
//

const testUser1 = {
    name: "test",
    email: "test@hotmail.com",
    phone: "+358123456789",
    password: "test1234",
}
let auth1 = {
    uid: "",
    token: "",
    refreshToken: "",
}
let user1ListingIds = []

const testUser2 = {
    name: "testi",
    email: "testi@hotmail.com",
    phone: "+358123456710",
    password: "test1235",
}
let auth2 = {
    uid: "",
    token: "",
    refreshToken: "",
}
let user2listingIds = []

const testListing1 = {
    title: "Asus gaming laptop",
    category: "computers",
    manufacturer: "Asus",
    description: "Powerful gaming laptop with from Asus",
    askingPrice: "2000",
    location: "Oulu",
    shipping: true,
    pickup: true,
    image: path.resolve(__dirname, "../resources/laptop.jpg"),
}

const testListing2 = {
    title: "Macbook Pro 2019",
    category: "computers",
    manufacturer: "Apple",
    description: "Mint condition base model Macbook Pro",
    askingPrice: "999",
    location: "Rovaniemi",
    shipping: false,
    pickup: true,
    image: path.resolve(__dirname, "../resources/laptop.jpg"),
}

//
// Tests
//

describe("Offline tests with Firebase Emulator", () => {
    before(() => {})
    after(() => {})
    describe("Register a user with test data and delete its data with admin user", () => {
        before(() => {})
        after(() => {
            auth1.uid = ""
            auth1.token = ""
            auth1.refreshToken = ""
        })
        it("Should fail to register a user with missing name", (done) => {
            chai.request(apiUrl)
                .post("/users")
                .set("content-type", "application/json")
                .send({
                    // name: testUser1.name,
                    email: testUser1.email,
                    phone: testUser1.phone,
                    password: testUser1.password,
                })
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(400)
                    expect(res.body.uid).to.be.undefined
                    done()
                })
        })
        it("Should fail to register a user with missing email", (done) => {
            chai.request(apiUrl)
                .post("/users")
                .set("content-type", "application/json")
                .send({
                    name: "test",
                    // email: "test@hotmail.com",
                    phone: "+358123456789",
                    password: "test1234",
                })
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(400)
                    expect(res.body.uid).to.be.undefined
                    done()
                })
        })
        it("Should fail to register a user with missing phone number", (done) => {
            chai.request(apiUrl)
                .post("/users")
                .set("content-type", "application/json")
                .send({
                    name: testUser1.name,
                    email: testUser1.email,
                    // phone: testUser1.phone,
                    password: testUser1.password,
                })
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(400)
                    expect(res.body.uid).to.be.undefined
                    done()
                })
        })
        it("Should fail to register a user with missing password", (done) => {
            chai.request(apiUrl)
                .post("/users")
                .set("content-type", "application/json")
                .send({
                    name: testUser1.name,
                    email: testUser1.email,
                    phone: testUser1.phone,
                    // password: testUser1.password,
                })
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(400)
                    expect(res.body.uid).to.be.undefined
                    done()
                })
        })
        it("Should fail to register a user with too short password", (done) => {
            chai.request(apiUrl)
                .post("/users")
                .set("content-type", "application/json")
                .send({
                    name: testUser1.name,
                    email: testUser1.email,
                    phone: testUser1.phone,
                    password: "123",
                })
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(400)
                    expect(res.body.uid).to.be.undefined
                    done()
                })
        })
        it("Should fail to register a user with missing body", (done) => {
            chai.request(apiUrl)
                .post("/users")
                .set("content-type", "application/json")
                .send({
                    // name: testUser1.name,
                    // email: testUser1.email,
                    // phone: testUser1.phone,
                    // password: testUser1.password,
                })
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(400)
                    expect(res.body.uid).to.be.undefined
                    done()
                })
        })
        it("Should succeed to register a user", (done) => {
            chai.request(apiUrl)
                .post("/users")
                .set("content-type", "application/json")
                .send(testUser1)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(201)
                    expect(res.body.uid).to.not.be.undefined
                    auth1.uid = res.body.uid
                    done()
                })
        })
        it("Should fail to delete a test user in Firebase and its user-document with invalid admin key", (done) => {
            chai.request(apiUrl)
                .delete(`/admin/users/${auth1.uid}`)
                .set("content-type", "application/json")
                .set("key", functions.config().bci.admin.key + 1)
                .end((err, res) => {
                    if (err !== null) console.log(err)
                    expect(err).to.be.null
                    expect(res).to.have.status(401)
                    done()
                })
        })
        it("Should delete test user in Firebase and its user-document with admin user", (done) => {
            chai.request(apiUrl)
                .delete(`/admin/users/${auth1.uid}`)
                .set("content-type", "application/json")
                .set("key", functions.config().bci.admin.key)
                .end((err, res) => {
                    if (err !== null) console.log(err)
                    expect(err).to.be.null
                    expect(res).to.have.status(200)
                    done()
                })
        })
        it("Should fail to delete non-existing test user in Firebase and its user-document with admin key", (done) => {
            chai.request(apiUrl)
                .delete(`/admin/users/${auth1.uid}`)
                .set("content-type", "application/json")
                .set("key", functions.config().bci.admin.key)
                .end((err, res) => {
                    if (err !== null) console.log(err)
                    expect(err).to.be.null
                    expect(res).to.have.status(409)
                    done()
                })
        })
    })
    describe("Create a listing with registered user", () => {
        before(() => {})
        after(() => {
            auth1.uid = ""
            auth1.token = ""
            auth1.refreshToken = ""
        })
        it("Should successfully register a user", (done) => {
            chai.request(apiUrl)
                .post("/users")
                .set("content-type", "application/json")
                .send({
                    name: testUser1.name,
                    email: testUser1.email,
                    phone: testUser1.phone,
                    password: testUser1.password,
                })
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(201)
                    expect(res.body.uid).to.not.be.undefined
                    auth1.uid = res.body.uid
                    done()
                })
        })
        it("Should fail to create a listing without being logged in as a user", (done) => {
            chai.request(apiUrl)
                .post("/listings")
                .set("content-type", "multipart/form-data")
                .set("Authorization", "Bearer " + auth1.token)
                .attach(
                    "image1",
                    path.resolve(__dirname, "../resources/laptop.jpg")
                )
                .field("location", testListing1.location)
                .field("askingPrice", testListing1.askingPrice)
                .field("category", testListing1.category)
                .field("manufacturer", testListing1.manufacturer)
                .field("title", testListing1.title)
                .field("description", testListing1.description)
                .field("shipping", testListing1.shipping)
                .field("pickup", testListing1.pickup)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(401)
                    done()
                })
        })
        it("Should successfully login as a user and return tokens", (done) => {
            chai.request(apiUrl)
                .post("/login")
                .auth(testUser1.email, testUser1.password)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(200)
                    expect(res.body.token).to.be.a("string")
                    expect(res.body.refreshToken).to.be.a("string")
                    // Store tokens to use in another tests that require tokens
                    console.log("received token: " + res.body.token)
                    auth1.token = res.body.token
                    auth1.refreshToken = res.body.refreshToken
                    done()
                })
        })
        it("Should fail to create a listing without any images", (done) => {
            chai.request(apiUrl)
                .post("/listings")
                .set("content-type", "multipart/form-data")
                .set("Authorization", "Bearer " + auth1.token)
                // .attach(
                //     "image",
                //     path.resolve(__dirname, "../resources/laptop.jpg")
                // )
                .field("location", testListing1.location)
                .field("askingPrice", testListing1.askingPrice)
                .field("category", testListing1.category)
                .field("manufacturer", testListing1.manufacturer)
                .field("title", testListing1.title)
                .field("description", testListing1.description)
                .field("shipping", testListing1.shipping)
                .field("pickup", testListing1.pickup)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(400)
                    expect(res.body.message).to.equal(
                        "Not enough files provided"
                    )
                    expect(res.body.listingId).to.be.undefined
                    done()
                })
        })
        it("Should fail to create a listing with over four (4) images sent", (done) => {
            chai.request(apiUrl)
                .post("/listings")
                .set("content-type", "multipart/form-data")
                .set("Authorization", "Bearer " + auth1.token)
                .attach("image1", testListing1.image)
                .attach("image2", testListing1.image)
                .attach("image3", testListing1.image)
                .attach("image4", testListing1.image)
                .attach("image5", testListing1.image)
                .field("location", testListing1.location)
                .field("askingPrice", testListing1.askingPrice)
                .field("category", testListing1.category)
                .field("manufacturer", testListing1.manufacturer)
                .field("title", testListing1.title)
                .field("description", testListing1.description)
                .field("shipping", testListing1.shipping)
                .field("pickup", testListing1.pickup)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(400)
                    expect(res.body.message).to.equal("Too many files uploaded")
                    expect(res.body.listingId).to.be.undefined
                    done()
                })
        })
        it("Should successfully create a listing", (done) => {
            chai.request(apiUrl)
                .post("/listings")
                .set("content-type", "multipart/form-data")
                .set("Authorization", "Bearer " + auth1.token)
                .attach("image1", testListing1.image)
                .field("location", testListing1.location)
                .field("askingPrice", testListing1.askingPrice)
                .field("category", testListing1.category)
                .field("manufacturer", testListing1.manufacturer)
                .field("title", testListing1.title)
                .field("description", testListing1.description)
                .field("shipping", testListing1.shipping)
                .field("pickup", testListing1.pickup)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(201)
                    expect(res.body.listingId).to.be.a("string")
                    done()
                })
        })
        it("Should successfully fetch listings", (done) => {
            chai.request(apiUrl)
                .get("/listings")
                .set("content-type", "multipart/form-data")
                .query({ creatorId: auth1.uid })
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(200)
                    expect(res.body.listings).to.be.an("array")
                    expect(res.body.listings[0]).to.be.jsonSchema(
                        fetchListingSchema
                    )
                    done()
                })
        })
        it("Delete user's Firestore listings with images in Storage", (done) => {
            chai.request(apiUrl)
                .delete(`/admin/users/${auth1.uid}/listings`)
                .set("key", functions.config().bci.admin.key)
                .end((err, res) => {
                    if (err !== null) console.log(err)
                    expect(err).to.be.null
                    expect(res).to.have.status(200)
                    done()
                })
        })
        it("Fail to fetch listings as there is none", (done) => {
            chai.request(apiUrl)
                .get("/listings")
                .set("content-type", "multipart/form-data")
                .query({ creatorId: auth1.uid })
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res).to.have.status(200)
                    expect(res.body.listings).to.be.an("array")
                    expect(res.body.listings[0]).not.to.be.jsonSchema(
                        fetchListingSchema
                    )
                    done()
                })
        })
        it("Delete test user in Firebase and its user-document with admin user", (done) => {
            chai.request(apiUrl)
                .delete(`/admin/users/${auth1.uid}`)
                .set("key", functions.config().bci.admin.key)
                .end((err, res) => {
                    if (err !== null) console.log(err)
                    expect(err).to.be.null
                    expect(res).to.have.status(200)
                    done()
                })
        })
        describe("Create a listing on two users and fetch them. Delete listings one by one while fetching the listings between the deletions", () => {
            before(() => {})
            after(() => {
                auth1.uid = ""
                auth1.token = ""
                auth1.refreshToken = ""

                auth2.uid = ""
                auth2.token = ""
                auth2.refreshToken = ""
            })
            it("Should succeed to register the first user", (done) => {
                chai.request(apiUrl)
                    .post("/users")
                    .set("content-type", "application/json")
                    .send(testUser1)
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(201)
                        expect(res.body.uid).to.not.be.undefined
                        auth1.uid = res.body.uid
                        done()
                    })
            })
            it("Should successfully login the first user and return tokens", (done) => {
                chai.request(apiUrl)
                    .post("/login")
                    .auth(testUser1.email, testUser1.password)
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.token).to.be.a("string")
                        expect(res.body.refreshToken).to.be.a("string")
                        // Store tokens to use in another tests that require tokens
                        auth1.token = res.body.token
                        auth1.refreshToken = res.body.refreshToken
                        done()
                    })
            })
            it("Should successfully create a listing on the first user", (done) => {
                chai.request(apiUrl)
                    .post("/listings")
                    .set("content-type", "multipart/form-data")
                    .set("Authorization", "Bearer " + auth1.token)
                    .attach("image1", testListing1.image)
                    .field("location", testListing1.location)
                    .field("askingPrice", testListing1.askingPrice)
                    .field("category", testListing1.category)
                    .field("manufacturer", testListing1.manufacturer)
                    .field("title", testListing1.title)
                    .field("description", testListing1.description)
                    .field("shipping", testListing1.shipping)
                    .field("pickup", testListing1.pickup)
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(201)
                        expect(res.body.listingId).to.be.a("string")
                        done()
                    })
            })
            it("Should succeed to register the second user", (done) => {
                chai.request(apiUrl)
                    .post("/users")
                    .set("content-type", "application/json")
                    .send(testUser2)
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(201)
                        expect(res.body.uid).to.not.be.undefined
                        auth2.uid = res.body.uid
                        done()
                    })
            })
            it("Should successfully login the second user and return tokens", (done) => {
                chai.request(apiUrl)
                    .post("/login")
                    .auth(testUser2.email, testUser2.password)
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.token).to.be.a("string")
                        expect(res.body.refreshToken).to.be.a("string")
                        // Store tokens to use in another tests that require tokens
                        auth2.token = res.body.token
                        auth2.refreshToken = res.body.refreshToken
                        done()
                    })
            })
            it("Should successfully create a listing on the second user", (done) => {
                chai.request(apiUrl)
                    .post("/listings")
                    .set("content-type", "multipart/form-data")
                    .set("Authorization", "Bearer " + auth2.token)
                    .attach("image1", testListing2.image)
                    .field("location", testListing2.location)
                    .field("askingPrice", testListing2.askingPrice)
                    .field("category", testListing2.category)
                    .field("manufacturer", testListing2.manufacturer)
                    .field("title", testListing2.title)
                    .field("description", testListing2.description)
                    .field("shipping", testListing2.shipping)
                    .field("pickup", testListing2.pickup)
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(201)
                        expect(res.body.listingId).to.be.a("string")
                        done()
                    })
            })
            it("Should successfully fetch both user's listings", (done) => {
                chai.request(apiUrl)
                    .get("/listings")
                    .set("content-type", "multipart/form-data")
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.listings).to.be.an("array")
                        expect(res.body.listings[0]).to.be.jsonSchema(
                            fetchListingSchema
                        )
                        expect(res.body.listings[1]).to.be.jsonSchema(
                            fetchListingSchema
                        )
                        expect(res.body.listings[0].creatorId).to.be.oneOf([
                            auth1.uid,
                            auth2.uid,
                        ])
                        expect(res.body.listings[1].creatorId).to.be.oneOf([
                            auth1.uid,
                            auth2.uid,
                        ])
                        done()
                    })
            })
            it("Delete the first user's Firestore listings with images in Storage", (done) => {
                chai.request(apiUrl)
                    .delete(`/admin/users/${auth1.uid}/listings`)
                    .set("key", functions.config().bci.admin.key)
                    .end((err, res) => {
                        if (err !== null) console.log(err)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        done()
                    })
            })
            it("Should successfully fetch only the second user's listings", (done) => {
                chai.request(apiUrl)
                    .get("/listings")
                    .set("content-type", "multipart/form-data")
                    // .query({ creatorId: auth1.uid })
                    .end((err, res) => {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.listings).to.be.an("array")
                        expect(res.body.listings[0]).to.be.jsonSchema(
                            fetchListingSchema
                        )
                        expect(res.body.listings[0].creatorId).to.equal(
                            auth2.uid
                        )
                        done()
                    })
            })
            it("Delete the second user's Firestore listings with images in Storage", (done) => {
                chai.request(apiUrl)
                    .delete(`/admin/users/${auth2.uid}/listings`)
                    .set("key", functions.config().bci.admin.key)
                    .end((err, res) => {
                        if (err !== null) console.log(err)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        done()
                    })
            })
            it("Should fetch an empty array as both user's listings have been deleted", (done) => {
                chai.request(apiUrl)
                    .get("/listings")
                    .set("content-type", "multipart/form-data")
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.listings).to.be.an("array")
                        expect(res.body.listings[0]).not.to.be.jsonSchema(
                            fetchListingSchema
                        )
                        done()
                    })
            })
            it("Delete the first user in Firebase and its user-document with admin user", (done) => {
                chai.request(apiUrl)
                    .delete(`/admin/users/${auth1.uid}`)
                    .set("key", functions.config().bci.admin.key)
                    .end((err, res) => {
                        if (err !== null) console.log(err)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        done()
                    })
            })
            it("Delete the second user in Firebase and its user-document with admin user", (done) => {
                chai.request(apiUrl)
                    .delete(`/admin/users/${auth2.uid}`)
                    .set("key", functions.config().bci.admin.key)
                    .end((err, res) => {
                        if (err !== null) console.log(err)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        done()
                    })
            })
        })
        describe("User updates their listing's title", () => {
            before(() => {})
            after(() => {
                auth1.uid = ""
                auth1.token = ""
                auth1.refreshToken = ""

                user1ListingIds = []
            })
            it("Should succeed to register the user", (done) => {
                chai.request(apiUrl)
                    .post("/users")
                    .set("content-type", "application/json")
                    .send(testUser1)
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(201)
                        expect(res.body.uid).to.not.be.undefined
                        auth1.uid = res.body.uid
                        done()
                    })
            })
            it("Should successfully login the user and return tokens", (done) => {
                chai.request(apiUrl)
                    .post("/login")
                    .auth(testUser1.email, testUser1.password)
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.token).to.be.a("string")
                        expect(res.body.refreshToken).to.be.a("string")
                        // Store tokens to use in another tests that require tokens
                        auth1.token = res.body.token
                        auth1.refreshToken = res.body.refreshToken
                        done()
                    })
            })
            it("Should successfully create a listing for the user", (done) => {
                chai.request(apiUrl)
                    .post("/listings")
                    .set("content-type", "multipart/form-data")
                    .set("Authorization", "Bearer " + auth1.token)
                    .attach("image1", testListing1.image)
                    .field("location", testListing1.location)
                    .field("askingPrice", testListing1.askingPrice)
                    .field("category", testListing1.category)
                    .field("manufacturer", testListing1.manufacturer)
                    .field("title", testListing1.title)
                    .field("description", testListing1.description)
                    .field("shipping", testListing1.shipping)
                    .field("pickup", testListing1.pickup)
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(201)
                        expect(res.body.listingId).to.be.a("string")
                        user1ListingIds.push(res.body.listingId)
                        done()
                    })
            })
            it("Should fail to update the user's listing's title", (done) => {
                chai.request(apiUrl)
                    .put(`/listings/${user1ListingIds[0]}1`)
                    .set("content-type", "multipart/form-data")
                    .set("Authorization", "Bearer " + auth1.token)
                    .field("title", "Updated listing title")
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body.message).to.equal(
                            "No such listing exists"
                        )
                        done()
                    })
            })
            it("Should update the user's listing's title", (done) => {
                chai.request(apiUrl)
                    .put(`/listings/${user1ListingIds[0]}`)
                    .set("content-type", "multipart/form-data")
                    .set("Authorization", "Bearer " + auth1.token)
                    .field("title", "Updated listing title")
                    .end((err, res) => {
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        done()
                    })
            })
            it("Delete the user's Firestore listings with images in Storage", (done) => {
                chai.request(apiUrl)
                    .delete(`/admin/users/${auth1.uid}/listings`)
                    .set("key", functions.config().bci.admin.key)
                    .end((err, res) => {
                        if (err !== null) console.log(err)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        done()
                    })
            })
            it("Delete the user in Firebase and its user-document with admin user", (done) => {
                chai.request(apiUrl)
                    .delete(`/admin/users/${auth1.uid}`)
                    .set("key", functions.config().bci.admin.key)
                    .end((err, res) => {
                        if (err !== null) console.log(err)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        done()
                    })
            })
        })
    })
})

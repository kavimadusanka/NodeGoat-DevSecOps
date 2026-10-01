const crypto = require("crypto");

const PASSWORD_KEYLEN = 64;
const PASSWORD_COST = 16384;
const PASSWORD_BLOCK_SIZE = 8;
const PASSWORD_PARALLELISM = 1;

const hashPassword = password => {
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(String(password), salt, PASSWORD_KEYLEN, {
        N: PASSWORD_COST,
        r: PASSWORD_BLOCK_SIZE,
        p: PASSWORD_PARALLELISM
    });
    return { salt: salt.toString("hex"), passwordHash: hash.toString("hex") };
};

const verifyPassword = (password, user) => {
    if (!user || !user.passwordHash || !user.salt) return false;
    const salt = Buffer.from(user.salt, "hex");
    const expected = Buffer.from(user.passwordHash, "hex");
    const actual = crypto.scryptSync(String(password), salt, expected.length, {
        N: PASSWORD_COST,
        r: PASSWORD_BLOCK_SIZE,
        p: PASSWORD_PARALLELISM
    });
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

function UserDAO(db) {
    "use strict";
    const usersCol = db.collection("users");

    this.addUser = (userName, firstName, lastName, password, email, callback) => {
        const credentials = hashPassword(password);
        const user = {
            userName, firstName, lastName,
            benefitStartDate: this.getRandomFutureDate(),
            ...credentials
        };
        if (email) user.email = email;

        this.getNextSequence("userId", (err, id) => {
            if (err) return callback(err, null);
            user._id = id;
            usersCol.insert(user, (insertErr, result) =>
                !insertErr ? callback(null, result.ops[0]) : callback(insertErr, null));
        });
    };

    this.getRandomFutureDate = () => {
        const today = new Date();
        const day = (Math.floor((Math.random() * 10) + today.getDay()) % 29) || 1;
        const month = Math.floor((Math.random() * 10) + today.getMonth()) % 12;
        const year = Math.ceil(Math.random() * 30) + today.getFullYear();
        return `${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}`;
    };

    this.validateLogin = (userName, password, callback) => {
        usersCol.findOne({ userName: String(userName) }, (err, user) => {
            if (err) return callback(err, null);
            if (!user) {
                const e = new Error("Invalid username and/or password");
                e.authFailure = true;
                return callback(e, null);
            }
            if (!verifyPassword(password, user)) {
                const e = new Error("Invalid username and/or password");
                e.authFailure = true;
                return callback(e, null);
            }
            callback(null, user);
        });
    };

    this.getUserById = (userId, callback) =>
        usersCol.findOne({ _id: parseInt(userId, 10) }, callback);

    this.getUserByUserName = (userName, callback) =>
        usersCol.findOne({ userName: String(userName) }, callback);

    this.getNextSequence = (name, callback) => {
        db.collection("counters").findAndModify(
            { _id: name }, [], { $inc: { seq: 1 } }, { new: true },
            (err, data) => err ? callback(err, null) : callback(null, data.value.seq)
        );
    };
}

module.exports = { UserDAO, hashPassword };

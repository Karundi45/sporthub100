"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = require("express");
const generateToken = (res, userId) => {
    const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
    // Since we are building an API primarily for mobile, we will send the token in the response body.
    // For web, it would be better to set an HTTP-only cookie.
    return token;
};
exports.default = generateToken;
//# sourceMappingURL=generateToken.js.map
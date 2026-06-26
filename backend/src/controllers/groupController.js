"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinGroup = exports.getGroups = exports.createGroup = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Group_1 = __importDefault(require("../models/Group"));
const createGroup = async (req, res) => {
    try {
        const { name, description, isPrivate, location } = req.body;
        const group = await Group_1.default.create({
            name,
            description,
            isPrivate: isPrivate || false,
            admins: [req.user._id],
            members: [req.user._id],
            location
        });
        res.status(201).json(group);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createGroup = createGroup;
const getGroups = async (req, res) => {
    try {
        const groups = await Group_1.default.find({ isPrivate: false })
            .populate('admins', 'username')
            .limit(20);
        res.json(groups);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getGroups = getGroups;
const joinGroup = async (req, res) => {
    try {
        const group = await Group_1.default.findById(req.params.id);
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }
        if (group.members.includes(req.user._id)) {
            res.status(400).json({ message: 'Already a member' });
            return;
        }
        if (group.isPrivate) {
            if (!group.joinRequests.includes(req.user._id)) {
                group.joinRequests.push(req.user._id);
                await group.save();
            }
            res.json({ message: 'Join request sent' });
        }
        else {
            group.members.push(req.user._id);
            await group.save();
            res.json({ message: 'Successfully joined the group', group });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.joinGroup = joinGroup;
//# sourceMappingURL=groupController.js.map
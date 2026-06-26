"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinChallenge = exports.getChallenges = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Challenge_1 = __importDefault(require("../models/Challenge"));
const getChallenges = async (req, res) => {
    try {
        const challenges = await Challenge_1.default.find({
            endDate: { $gte: new Date() } // Get active and upcoming challenges
        }).sort({ startDate: 1 });
        res.json(challenges);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getChallenges = getChallenges;
const joinChallenge = async (req, res) => {
    try {
        const challenge = await Challenge_1.default.findById(req.params.id);
        if (!challenge) {
            res.status(404).json({ message: 'Challenge not found' });
            return;
        }
        const isParticipating = challenge.participants.some((p) => p.user.toString() === req.user._id.toString());
        if (!isParticipating) {
            challenge.participants.push({
                user: req.user._id,
                progress: 0,
                completed: false
            });
            await challenge.save();
        }
        res.json({ message: 'Joined challenge successfully', challenge });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.joinChallenge = joinChallenge;
//# sourceMappingURL=challengeController.js.map
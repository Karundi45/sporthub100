"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAnalytics = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Workout_1 = __importDefault(require("../models/Workout"));
const getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        // Aggregate total distance, duration, and calories
        const stats = await Workout_1.default.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalDistance: { $sum: '$distance' },
                    totalDuration: { $sum: '$duration' },
                    totalCalories: { $sum: '$calories' },
                    totalWorkouts: { $sum: 1 },
                },
            },
        ]);
        // Aggregate by activity type
        const activityDistribution = await Workout_1.default.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: '$activityType',
                    count: { $sum: 1 },
                    distance: { $sum: '$distance' }
                }
            }
        ]);
        res.json({
            overall: stats.length > 0 ? stats[0] : { totalDistance: 0, totalDuration: 0, totalCalories: 0, totalWorkouts: 0 },
            activityDistribution
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUserAnalytics = getUserAnalytics;
//# sourceMappingURL=analyticsController.js.map
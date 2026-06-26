"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const RoutePointSchema = new mongoose_1.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    altitude: { type: Number },
    timestamp: { type: Date, required: true },
    speed: { type: Number },
    heartRate: { type: Number },
}, { _id: false });
const WorkoutSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    activityType: {
        type: String,
        required: true,
        enum: ['Walking', 'Running', 'Trail Running', 'Cycling', 'Mountain Biking', 'Swimming', 'Hiking', 'Gym', 'Yoga', 'Football', 'Basketball', 'Volleyball', 'Tennis', 'Badminton', 'Boxing', 'Skating', 'Rowing', 'Kayaking', 'Custom']
    },
    description: { type: String, default: '' },
    route: [RoutePointSchema],
    distance: { type: Number, default: 0 },
    duration: { type: Number, required: true },
    movingTime: { type: Number, required: true },
    stoppedTime: { type: Number, default: 0 },
    averageSpeed: { type: Number, default: 0 },
    maxSpeed: { type: Number, default: 0 },
    averagePace: { type: Number, default: 0 },
    maxPace: { type: Number, default: 0 },
    elevationGain: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    averageHeartRate: { type: Number },
    maxHeartRate: { type: Number },
    cadence: { type: Number },
    steps: { type: Number },
    photos: [{ type: String }],
    privacy: { type: String, enum: ['public', 'private', 'followers'], default: 'public' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Workout', WorkoutSchema);
//# sourceMappingURL=Workout.js.map
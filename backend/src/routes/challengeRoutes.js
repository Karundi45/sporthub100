"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const challengeController_1 = require("../controllers/challengeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/').get(authMiddleware_1.protect, challengeController_1.getChallenges);
router.route('/:id/join').post(authMiddleware_1.protect, challengeController_1.joinChallenge);
exports.default = router;
//# sourceMappingURL=challengeRoutes.js.map
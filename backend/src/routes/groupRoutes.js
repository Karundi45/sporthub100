"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const groupController_1 = require("../controllers/groupController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/').post(authMiddleware_1.protect, groupController_1.createGroup).get(authMiddleware_1.protect, groupController_1.getGroups);
router.route('/:id/join').post(authMiddleware_1.protect, groupController_1.joinGroup);
exports.default = router;
//# sourceMappingURL=groupRoutes.js.map
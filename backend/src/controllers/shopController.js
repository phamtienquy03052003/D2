import User from "../models/User.js";
import UserPoint from "../models/UserPoint.js";
import PointHistory from "../models/PointHistory.js";
import { addXP } from "../utils/levelUtils.js";

const XP_PACKAGES = {
    small: { cost: 10, xp: 10 },
    medium: { cost: 95, xp: 100 },
    large: { cost: 900, xp: 1000 },
    xlarge: { cost: 8500, xp: 10000 }
};

export const NAME_TAGS = {
    "nametag_vip": { id: "nametag_vip", name: "VIP", cost: 500, style: "vip" },
    "nametag_rich": { id: "nametag_rich", name: "Đại Gia", cost: 1000, style: "rich" },
    "nametag_cool": { id: "nametag_cool", name: "Dân Chơi", cost: 300, style: "cool" },
    "nametag_master": { id: "nametag_master", name: "Bậc Thầy", cost: 2000, style: "master" },
};

export const getShopItems = async (req, res) => {
    try {
        res.json({
            xpPackages: XP_PACKAGES,
            nameTags: NAME_TAGS
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const buyNameTag = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id;

        if (!NAME_TAGS[itemId]) {
            return res.status(400).json({ message: "Vật phẩm không hợp lệ" });
        }

        const item = NAME_TAGS[itemId];
        const userPoint = await UserPoint.findOne({ user: userId });
        const user = await User.findById(userId);

        if (!userPoint || userPoint.totalPoints < item.cost) {
            return res.status(400).json({ message: "Không đủ điểm để mua vật phẩm này" });
        }

        if (user.inventory && user.inventory.includes(itemId)) {
            return res.status(400).json({ message: "Bạn đã sở hữu vật phẩm này rồi" });
        }

        // Trừ điểm
        userPoint.totalPoints -= item.cost;
        await userPoint.save();

        // Thêm vào inventory
        if (!user.inventory) user.inventory = [];
        user.inventory.push(itemId);
        await user.save();

        // Lưu lịch sử trừ điểm
        await PointHistory.create({
            user: userId,
            amount: item.cost,
            reason: `Mua thẻ tên ${item.name}`,
            type: "subtract",
            onModel: "User",
            relatedId: userId
        });

        res.json({
            message: "Mua thành công",
            newPoints: userPoint.totalPoints,
            inventory: user.inventory
        });

    } catch (err) {
        console.error("Buy Name Tag error:", err);
        res.status(500).json({ message: err.message });
    }
};

export const buyXP = async (req, res) => {
    try {
        const { packageId } = req.body;
        const userId = req.user.id;
        const io = req.app.get("io");

        if (!XP_PACKAGES[packageId]) {
            return res.status(400).json({ message: "Gói không hợp lệ" });
        }

        const pkg = XP_PACKAGES[packageId];

        const userPoint = await UserPoint.findOne({ user: userId });
        if (!userPoint || userPoint.totalPoints < pkg.cost) {
            return res.status(400).json({ message: "Không đủ điểm để mua gói này" });
        }

        // Trừ điểm
        userPoint.totalPoints -= pkg.cost;
        await userPoint.save();

        // Lưu lịch sử trừ điểm
        await PointHistory.create({
            user: userId,
            amount: pkg.cost,
            reason: `Mua ${pkg.xp} điểm kinh nghiệm`,
            type: "subtract",
            onModel: "User",
            relatedId: userId
        });

        // Cộng XP bằng hàm tiện ích (tự động xử lý level up và lưu lịch sử XP)
        const { user } = await addXP(userId, pkg.xp, "Đổi từ điểm thưởng", null, null, io);

        res.json({
            message: "Mua thành công",
            newPoints: userPoint.totalPoints,
            newXP: user.experience,
            newLevel: user.level
        });

    } catch (err) {
        console.error("Buy XP error:", err);
        res.status(500).json({ message: err.message });
    }
};

import User from "../models/User.js";
import UserPoint from "../models/UserPoint.js";
import PointHistory from "../models/PointHistory.js";
import ShopItem from "../models/ShopItem.js";
import { addXP } from "../utils/level.js";

/**
 * Lấy danh sách vật phẩm trong cửa hàng
 * - Phân loại: Gói XP, Thẻ tên, Khác.
 */
export const getShopItems = async (req, res) => {
    try {
        const items = await ShopItem.find({}).sort({ sortOrder: 1 });

        const xpPackages = items.filter(i => i.type === 'xp_package');
        const nameTags = items.filter(i => i.type === 'name_tag');
        const others = items.filter(i => !['xp_package', 'name_tag'].includes(i.type));

        res.json({
            xpPackages,
            nameTags,
            others
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Mua vật phẩm
 * - Kiểm tra số dư điểm.
 * - Xử lý mua Gói XP (cộng trực tiếp vào Level).
 * - Xử lý mua Thẻ tên/Vật phẩm khác (thêm vào Inventory).
 * - Lưu lịch sử giao dịch.
 */
export const buyItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id;

        const item = await ShopItem.findById(itemId);
        if (!item || !item.isActive) {
            return res.status(400).json({ message: "Vật phẩm không tồn tại hoặc đã ngừng bán" });
        }

        const userPoint = await UserPoint.findOne({ user: userId });
        const user = await User.findById(userId);

        if (!userPoint || userPoint.totalPoints < item.price) {
            return res.status(400).json({ message: "Không đủ điểm để mua vật phẩm này" });
        }


        if (item.type === 'xp_package') {

            let xpAmount = 0;
            try {

                const value = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
                xpAmount = Number(value.xp || value);
            } catch (e) {
                xpAmount = Number(item.value);
            }

            if (!xpAmount || isNaN(xpAmount)) {
                return res.status(500).json({ message: "Cấu hình gói XP không hợp lệ" });
            }


            userPoint.totalPoints -= item.price;
            await userPoint.save();


            await PointHistory.create({
                user: userId,
                amount: item.price,
                reason: `Mua gói ${item.name}`,
                type: "subtract",
                onModel: "User",
                relatedId: userId
            });


            const io = req.app.get("io");
            const { user: updatedUser } = await addXP(userId, xpAmount, "Đổi từ điểm thưởng", null, null, io);

            return res.json({
                message: "Mua thành công",
                newPoints: userPoint.totalPoints,
                newXP: updatedUser.experience,
                newLevel: updatedUser.level,
                type: 'xp'
            });

        } else {

            if (user.inventory && user.inventory.includes(item._id.toString())) {
                return res.status(400).json({ message: "Bạn đã sở hữu vật phẩm này rồi" });
            }


            userPoint.totalPoints -= item.price;
            await userPoint.save();


            if (!user.inventory) user.inventory = [];
            user.inventory.push(item._id.toString());
            await user.save();


            await PointHistory.create({
                user: userId,
                amount: item.price,
                reason: `Mua ${item.name}`,
                type: "subtract",
                onModel: "User",
                relatedId: userId
            });

            return res.json({
                message: "Mua thành công",
                newPoints: userPoint.totalPoints,
                inventory: user.inventory,
                type: 'item'
            });
        }

    } catch (err) {
        console.error("Buy Item error:", err);
        res.status(500).json({ message: err.message });
    }
};


export const buyNameTag = buyItem;
export const buyXP = buyItem;

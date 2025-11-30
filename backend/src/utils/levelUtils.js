import User from "../models/User.js";
import ExperienceHistory from "../models/ExperienceHistory.js";

export const getRequiredXP = (level) => {
    if (level === 0) return 10;
    if (level === 1) return 100;
    if (level === 2) return 1000;
    return (level - 1) * 1000;
};

export const addXP = async (userId, amount, reason, relatedId, onModel, io) => {
    try {
        let user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Add to current XP
        user.experience += amount;

        let leveledUp = false;
        let requiredXP = getRequiredXP(user.level);

        // Check for level up (loop in case of massive XP gain)
        while (user.experience >= requiredXP) {
            user.experience -= requiredXP;
            user.level += 1;
            leveledUp = true;
            requiredXP = getRequiredXP(user.level);
        }

        await user.save();

        // Create history for XP
        const history = new ExperienceHistory({
            user: userId,
            amount: amount,
            reason: reason,
            type: "add",
            relatedId: relatedId,
            onModel: onModel
        });
        await history.save();

        // Emit event
        if (io) {
            io.to(userId).emit("xpAdded", {
                user: userId,
                xp: amount,
                reason: reason,
                currentXP: user.experience,
                level: user.level,
                requiredXP: requiredXP,
                leveledUp: leveledUp
            });
        }

        return { user, leveledUp };
    } catch (err) {
        console.error("Error adding XP:", err);
        throw err;
    }
};

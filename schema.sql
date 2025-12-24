-- Christmas Tree Blessings Database Schema
-- Create table for blessings and wishes

CREATE TABLE IF NOT EXISTS blessings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('blessing', 'wish')),
    content TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    country TEXT,
    author_name TEXT,
    is_anonymous INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_builtin INTEGER DEFAULT 0
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_type ON blessings(type);
CREATE INDEX IF NOT EXISTS idx_created_at ON blessings(created_at);
CREATE INDEX IF NOT EXISTS idx_is_builtin ON blessings(is_builtin);

-- Insert built-in blessings (20+ in multiple languages)
INSERT INTO blessings (type, content, language, country, is_builtin) VALUES
-- English Blessings (10)
('blessing', 'May your Christmas be filled with warmth, love, and endless joy!', 'en', 'US', 1),
('blessing', 'Wishing you peace, happiness, and all the best this holiday season!', 'en', 'GB', 1),
('blessing', 'May your home be filled with laughter and your heart with love this Christmas!', 'en', 'CA', 1),
('blessing', 'Sending you warm hugs and merry wishes across the miles!', 'en', 'AU', 1),
('blessing', 'May this Christmas bring you new hopes, dreams, and beautiful memories!', 'en', 'US', 1),
('blessing', 'Wishing you a season of joy and a New Year filled with happiness!', 'en', 'IE', 1),
('blessing', 'May the magic of Christmas fill your heart with wonder and delight!', 'en', 'NZ', 1),
('blessing', 'Hope your holidays are merry, bright, and full of precious moments!', 'en', 'US', 1),
('blessing', 'Wishing you love, light, and laughter this Christmas season!', 'en', 'GB', 1),
('blessing', 'May your days be merry and bright, and your Christmas divine!', 'en', 'CA', 1),

-- Chinese Blessings (5)
('blessing', '願你的聖誕節充滿溫暖、愛與無盡的喜悅！', 'zh', 'TW', 1),
('blessing', '祝你平安喜樂，聖誕節快樂，新年幸福！', 'zh', 'CN', 1),
('blessing', '願這個聖誕節為你帶來新的希望與美好回憶！', 'zh', 'HK', 1),
('blessing', '聖誕快樂！願你與家人共度溫馨時光！', 'zh', 'SG', 1),
('blessing', '願聖誕的溫暖照亮你的每一天，幸福永伴！', 'zh', 'MY', 1),

-- Other Languages (5)
('blessing', 'Joyeux Noël! Que la magie de Noël remplisse votre cœur!', 'fr', 'FR', 1),
('blessing', 'Frohe Weihnachten! Möge Ihr Herz voller Freude sein!', 'de', 'DE', 1),
('blessing', '¡Feliz Navidad! Que la ilusión navideña te llene de felicidad!', 'es', 'ES', 1),
('blessing', 'Buon Natale! Auguri di pace e gioia per te!', 'it', 'IT', 1),
('blessing', 'メリークリスマス！素敵な休日をお過ごしください！', 'ja', 'JP', 1),

-- Wishes (15 practical and realistic wishes)
('wish', 'I wish to spend more quality time with my family next year', 'en', 'US', 1),
('wish', 'I hope to learn a new skill or hobby in the coming year', 'en', 'GB', 1),
('wish', 'I wish for good health for my parents and loved ones', 'en', 'CA', 1),
('wish', 'I hope to travel and explore new places next year', 'en', 'AU', 1),
('wish', 'I wish to find more balance between work and life', 'en', 'US', 1),
('wish', 'I hope to read more books and expand my knowledge', 'en', 'IE', 1),
('wish', 'I wish to make new meaningful friendships', 'en', 'NZ', 1),
('wish', 'I hope to be more patient and understanding with others', 'en', 'GB', 1),
('wish', 'I wish to appreciate the small moments in life more', 'en', 'CA', 1),
('wish', 'I hope to stay positive and hopeful even in difficult times', 'en', 'US', 1),

('wish', '我希望明年能多陪陪家人，珍惜相處時光', 'zh', 'TW', 1),
('wish', '我願能學會一項新技能，充實自己', 'zh', 'CN', 1),
('wish', '希望家人和朋友都身體健康，平安喜樂', 'zh', 'HK', 1),
('wish', '我願明年能去旅行，看看外面的世界', 'zh', 'SG', 1),
('wish', '希望自己在工作上能有新的突破和成長', 'zh', 'MY', 1);

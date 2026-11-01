// Generates a FAKE demo catalog in web/content-demo (never touches web/content).
// Usage: npm run gen:demo
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "content-demo");

const REAL_STORY_ID = "20261025_102359";

// Deterministic PRNG so output is stable between runs.
let seed = 20260101;
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const titlePool = [
  "Gặp gỡ trong mưa", "Kiếm khí tung hoành", "Đêm trăng huyền bí", "Bí cảnh mở cửa",
  "Cố nhân trở lại", "Phá cảnh đột phá", "Núi sâu ẩn sĩ", "Thanh kiếm gãy",
  "Hội đấu giá bất ngờ", "Dị thú xuất thế", "Lời thề năm xưa", "Cuộc chiến ở Thiên Môn",
  "Đan dược quý hiếm", "Mê trận sương mù", "Truyền nhân bí ẩn", "Giang hồ dậy sóng",
  "Một chén trà lạnh", "Ngã rẽ số phận", "Ánh sao rơi xuống", "Khách điếm cuối đường",
];

const paragraphs = [
  "Gió núi thổi qua, mang theo hơi sương lạnh buốt. Nhân vật chính đứng lặng trước cổng đá cũ, lắng nghe tiếng chuông xa vọng lại từ đỉnh núi.",
  "Mọi chuyện chỉ mới bắt đầu. Phía trước là con đường dài chưa ai dám đặt chân, nhưng trong lòng anh đã có quyết định cho riêng mình.",
  "Đây là nội dung minh họa dùng để thử giao diện. Văn bản này không thuộc về bất kỳ tác phẩm thật nào.",
  "Ánh trăng đổ xuống mái ngói, kéo dài chiếc bóng đơn độc. Một lời hứa cũ lại vang lên trong tâm trí.",
];

function chapterText() {
  return `${pick(paragraphs)}\n\n${pick(paragraphs)}`;
}

// [slug, title, genre, tags, chapters, featured, daysAgo, description, synopsis]
const stories = [
  ["vo-cuc-kiem-ton", "Vô Cực Kiếm Tôn", "Tu tiên", ["kiếm tu", "hệ thống", "trọng sinh"], 1200, true, 0,
    "Một kiếm tu trẻ tuổi thức tỉnh trong thế giới tu tiên mới lạ và bước lên con đường vô cực.",
    "Lý Vô Cực tỉnh dậy trong một thân xác xa lạ giữa thế giới tu tiên. Với bộ não máy tính nội tâm và thanh kiếm gãy bí ẩn, anh từng bước đi qua luyện khí, trúc cơ, kim đan để tìm lời giải cho vòng luân hồi."],
  ["thien-dao-do-de", "Thiên Đạo Đồ Đệ", "Tu tiên", ["đồ đệ", "tông môn"], 350, false, 2,
    "Đệ tử ngoại môn tình cờ nhận được truyền thừa của một vị thiên đạo cổ xưa.",
    "Giữa tông môn rộng lớn, một đệ tử ngoại môn vô danh nhặt được ngọc giản cổ. Từ đó vận mệnh của cậu gắn chặt với bí mật của thiên đạo."],
  ["long-van-co-duc", "Long Vân Cổ Đức", "Huyền huyễn", ["rồng", "đại lục", "phiêu lưu"], 200, true, 1,
    "Hành trình của thiếu niên mang huyết mạch rồng trên đại lục rộng lớn.",
    "Đại lục Long Vân có chín tòa thành cổ, mỗi tòa giữ một mảnh phong ấn. Thiếu niên mang huyết mạch rồng phải tập hợp đủ chín mảnh trước khi trăng máu xuất hiện."],
  ["tinh-khong-di-gioi", "Tinh Không Dị Giới", "Huyền huyễn", ["dị giới", "tinh không"], 120, false, 5,
    "Cánh cửa dị giới mở ra giữa trời sao, kéo theo một cuộc chiến vượt ngoài tưởng tượng.",
    "Khi cánh cửa tinh không mở ra, nhân loại buộc phải học cách tu luyện ngay trong chân không. Một nhóm lính đánh thuê trở thành tia hy vọng cuối cùng."],
  ["giang-ho-nhat-kiem", "Giang Hồ Nhất Kiếm", "Kiếm hiệp", ["giang hồ", "báo thù"], 60, false, 3,
    "Một nhát kiếm, một lời thề và cả giang hồ dậy sóng.",
    "Mười năm sau biến cố Thanh Phong Trại, người kiếm khách mang theo thanh kiếm gãy trở lại giang hồ để đòi món nợ máu."],
  ["kiem-khach-vo-danh", "Kiếm Khách Vô Danh", "Kiếm hiệp", ["ẩn sĩ", "võ lâm"], 24, false, 8,
    "Người kiếm khách không tên và những cuộc gặp gỡ bên đường.",
    "Không ai biết tên ông, chỉ biết mỗi nơi ông đi qua đều để lại một câu chuyện. Một tập truyện ngắn nối nhau về nghĩa khí giang hồ."],
  ["do-thi-tu-chan", "Đô Thị Tu Chân", "Đô thị", ["hiện đại", "tu chân", "hài"], 40, false, 4,
    "Nhân viên văn phòng bình thường bất ngờ trở thành tu sĩ giữa lòng thành phố.",
    "Sau một lần đi làm muộn, anh nhân viên văn phòng nhặt được viên ngọc lạ. Từ đó cuộc sống đô thị của anh không còn bình thường nữa."],
  ["thanh-pho-khong-ngu", "Thành Phố Không Ngủ", "Đô thị", ["trinh thám", "hiện đại"], 8, false, 12,
    "Những vụ án kỳ lạ xảy ra vào đêm khuya tại một thành phố không bao giờ ngủ.",
    "Cảnh sát hình sự trẻ phát hiện các vụ án đêm khuya đều dẫn về một tòa nhà bỏ hoang. Bí mật của tòa nhà liên quan đến chính gia đình anh."],
  ["hoa-no-ben-song", "Hoa Nở Bên Sông", "Ngôn tình", ["lãng mạn", "cổ trang"], 3, true, 6,
    "Mối duyên nhẹ nhàng nở rộ bên bờ sông vào một mùa xuân cổ xưa.",
    "Cô gái bán hoa bên sông gặp chàng thư sinh lỡ độ đường. Một chiếc khăn tay, một mùa xuân và những điều chưa kịp nói."],
];

function chapterFor(i, nChapters, storyIdx) {
  const idx = i + 1;
  const duration = 600 + Math.floor(rand() * 901); // 600-1500 s
  const title = pick(titlePool);
  const useReal = idx === 1 && storyIdx < 3; // first 3 stories play the real test audio
  return {
    index: idx,
    title,
    summary: `Tóm tắt minh họa cho ${title.toLowerCase()}.`,
    duration_seconds: duration,
    audio_key: `audio/demo/chuong_${idx}.mp3`,
    audio_file: useReal ? "chuong_1.mp3" : `chuong_${idx}.mp3`,
    text: chapterText(),
  };
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, "stories"), { recursive: true });

const now = Date.now();
const summaries = [];
stories.forEach(([slug, title, genre, tags, n, featured, daysAgo, description, synopsis], si) => {
  const chapters = Array.from({ length: n }, (_, i) => chapterFor(i, n, si));
  const total = chapters.reduce((a, c) => a + c.duration_seconds, 0);
  const summary = {
    slug,
    story_id: REAL_STORY_ID,
    title,
    description,
    genre,
    tags,
    synopsis,
    featured,
    demo: true,
    cover: "📖",
    chapter_count: n,
    total_duration_seconds: total,
    updated_at: new Date(now - daysAgo * 86400000).toISOString().replace(/\.\d+Z$/, "+00:00"),
  };
  summaries.push(summary);
  const detail = { ...summary, voice: "demo", chapters };
  fs.writeFileSync(
    path.join(outDir, "stories", `${slug}.json`),
    JSON.stringify(detail, null, 2) + "\n",
  );
});
fs.writeFileSync(
  path.join(outDir, "stories.json"),
  JSON.stringify({ stories: summaries }, null, 2) + "\n",
);
console.log(`Generated ${summaries.length} demo stories in ${outDir}`);

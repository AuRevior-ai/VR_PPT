export type HotspotId = 'teacher' | 'blackboard' | 'class-rules' | 'students';

export type ClassroomHotspot = {
  id: HotspotId;
  label: string;
  title: string;
  description: string;
  details: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  tone: 'coral' | 'green' | 'blue' | 'yellow';
};

// Hotspots use source-image percentage coordinates. Move or resize these values
// when swapping to a new classroom illustration or adding course content.
export const hotspots: ClassroomHotspot[] = [
  {
    id: 'teacher',
    label: '老师',
    title: '老师正在讲课',
    description: '老师正在带孩子们朗读黑板上的古诗，并引导大家观察诗句里的山、水和花。',
    details: ['可接入语音讲解', '可加入表情动作', '可切换课程脚本'],
    x: 51,
    y: 45,
    width: 13,
    height: 22,
    tone: 'coral'
  },
  {
    id: 'blackboard',
    label: '黑板',
    title: '今日课程内容',
    description: '课程主题是古诗欣赏。这里可以放置拼音、关键词、互动问答或板书动画。',
    details: ['诗句逐行高亮', '点击粉笔画弹出解释', '支持替换成数学/英语课程'],
    x: 55,
    y: 29,
    width: 38,
    height: 24,
    tone: 'green'
  },
  {
    id: 'class-rules',
    label: '公约',
    title: '班级公约',
    description: '班级公约区域适合做习惯养成互动，让孩子点击查看课堂规则和奖励提示。',
    details: ['上课认真听', '作业要按时', '卫生要保持', '纪律要遵守'],
    x: 89,
    y: 25,
    width: 15,
    height: 30,
    tone: 'blue'
  },
  {
    id: 'students',
    label: '学生',
    title: '学生互动对话',
    description: '学生区域可以承载跟读、举手、选择答案等轻量互动，让画面从插画变成课堂情境。',
    details: ['“我知道答案！”', '“这句诗是什么意思？”', '“我们一起读一遍。”'],
    x: 50,
    y: 75,
    width: 64,
    height: 32,
    tone: 'yellow'
  }
];

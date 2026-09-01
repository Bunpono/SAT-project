import { useState } from "react"

const guideContent = {
  en: {
    eyebrow: "User Guide",
    title: "How to use the Syntactic Analysis Tool",
    intro: "Turn an English sentence into an interactive syntax tree by following the steps below. No technical knowledge is required.",
    languageLabel: "Guide language",
    featuresTitle: "What you can do",
    availableNow: "No sign-in needed",
    signInRequired: "Sign in required",
    features: [
      { icon: "tree", title: "Analyze and explore", description: "Analyze a sentence, view its S-expression, and explore the interactive syntax tree.", access: "guest" },
      { icon: "history", title: "Save your history", description: "Reopen, search, repeat, or delete analyses saved to your account.", access: "account" },
      { icon: "report", title: "Report a result", description: "Tell the administrator when an analysis may be incorrect.", access: "account" }
    ],
    stepsTitle: "Start an analysis",
    steps: [
      { icon: "keyboard", title: "Enter an English sentence", description: "Type or paste the sentence you want to examine into the Input Sentence box." },
      { icon: "analyze", title: "Click Analyze Syntax", description: "Select Analyze Syntax and wait briefly while the sentence is processed." },
      { icon: "result", title: "View the analysis", description: "Read the S-expression in Analysis Results, then explore the syntax tree below it." },
      { icon: "pointer", title: "Explore the tree", description: "Click a tree node to highlight the word or phrase connected to that part of the sentence." },
      { icon: "history", title: "Review previous results", description: "Sign in and open Analysis History to revisit results saved to your account." }
    ],
    supportedTitle: "Supported Input",
    supportedItems: [
      { state: "yes", text: "English declarative sentences" },
      { state: "yes", text: "Simple, Compound, and Complex sentences" },
      { state: "no", text: "Questions, commands, exclamations, non-English text, or emojis" }
    ],
    tipLabel: "Tip:",
    tip: "Start with a short, complete sentence such as “I love a dog.” for the clearest result."
  },
  th: {
    eyebrow: "คู่มือการใช้งาน",
    title: "วิธีใช้เครื่องมือวิเคราะห์โครงสร้างประโยค",
    intro: "เปลี่ยนประโยคภาษาอังกฤษให้เป็นแผนภาพต้นไม้แบบโต้ตอบได้ตามขั้นตอนด้านล่าง โดยไม่จำเป็นต้องมีความรู้ด้านภาษาศาสตร์มาก่อน",
    languageLabel: "ภาษาของคู่มือ",
    featuresTitle: "ฟังก์ชันที่ใช้งานได้",
    availableNow: "ใช้ได้ทันที ไม่ต้องล็อกอิน",
    signInRequired: "ต้องล็อกอิน",
    features: [
      { icon: "tree", title: "วิเคราะห์และสำรวจโครงสร้าง", description: "วิเคราะห์ประโยค ดู S-expression และสำรวจแผนภาพต้นไม้แบบโต้ตอบ", access: "guest" },
      { icon: "history", title: "บันทึกประวัติของคุณ", description: "เปิดดู ค้นหา วิเคราะห์ซ้ำ หรือลบผลวิเคราะห์ที่บันทึกไว้ในบัญชี", access: "account" },
      { icon: "report", title: "รายงานผลที่อาจไม่ถูกต้อง", description: "แจ้งผู้ดูแลระบบเมื่อพบว่าผลการวิเคราะห์อาจมีข้อผิดพลาด", access: "account" }
    ],
    stepsTitle: "เริ่มวิเคราะห์ประโยค",
    steps: [
      { icon: "keyboard", title: "ป้อนประโยคภาษาอังกฤษ", description: "พิมพ์หรือวางประโยคที่ต้องการตรวจสอบลงในช่อง Input Sentence" },
      { icon: "analyze", title: "กด Analyze Syntax", description: "กดปุ่ม Analyze Syntax แล้วรอสักครู่ระหว่างที่ระบบประมวลผลประโยค" },
      { icon: "result", title: "ดูผลการวิเคราะห์", description: "ดู S-expression ใน Analysis Results และดูแผนภาพต้นไม้ที่อยู่ด้านล่าง" },
      { icon: "pointer", title: "สำรวจแผนภาพต้นไม้", description: "กดที่โหนดเพื่อเน้นคำหรือวลีที่สัมพันธ์กับส่วนนั้นของประโยค" },
      { icon: "history", title: "ย้อนดูผลลัพธ์เดิม", description: "ล็อกอินแล้วเปิด Analysis History เพื่อดูผลที่บันทึกไว้ในบัญชีของคุณ" }
    ],
    supportedTitle: "ข้อมูลที่ระบบรองรับ",
    supportedItems: [
      { state: "yes", text: "ประโยคบอกเล่าภาษาอังกฤษ" },
      { state: "yes", text: "ประโยค Simple, Compound และ Complex" },
      { state: "no", text: "ไม่รองรับคำถาม คำสั่ง คำอุทาน ข้อความที่ไม่ใช่ภาษาอังกฤษ หรืออีโมจิ" }
    ],
    tipLabel: "คำแนะนำ:",
    tip: "เริ่มจากประโยคสั้นและสมบูรณ์ เช่น “I love a dog.” เพื่อให้ได้ผลลัพธ์ที่ชัดเจนที่สุด"
  }
}

function GuideIcon({ name, className = "h-6 w-6" }) {
  const paths = {
    tree: <path d="M12 4v5m0 0-5 4m5-4 5 4M7 13v4m10-4v4M4.5 20h5m5 0h5" />,
    history: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2" />,
    report: <path d="M5 21V4m0 1h11l-2 4 2 4H5M12 17.5v.01" />,
    keyboard: <path d="M3 7h18v11H3V7Zm4 4h.01M10 11h.01M13 11h.01M16 11h.01M7 15h10" />,
    analyze: <path d="m9 18 6-12m-9 5-3 3 3 3m12-6 3 3-3 3" />,
    result: <path d="M6 3h9l3 3v15H6V3Zm8 0v4h4M9 11h6m-6 4h6" />,
    pointer: <path d="m7 3 10 9-5 .8 3 5.2-2.5 1.5-3-5.2L7 18V3Z" />
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {paths[name]}
      </g>
    </svg>
  )
}

function getInitialLanguage() {
  if (typeof window === "undefined") return "en"
  const savedLanguage = window.localStorage.getItem("sat-guide-language")
  if (savedLanguage === "th" || savedLanguage === "en") return savedLanguage
  return window.navigator.language?.toLowerCase().startsWith("th") ? "th" : "en"
}

export default function HowToUse() {
  const [language, setLanguage] = useState(getInitialLanguage)
  const content = guideContent[language]

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage)
    window.localStorage.setItem("sat-guide-language", nextLanguage)
  }

  return (
    <section className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 sm:p-6 lg:p-8 dark:border-[#263042] dark:bg-[#111827] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl min-w-0">
          <p className="text-base font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{content.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold text-[#111827] dark:text-white">{content.title}</h2>
          <p className="mt-2 text-[#6B7280] dark:text-[#D1D5DB]">{content.intro}</p>
        </div>

        <div className="shrink-0">
          <p className="mb-2 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">{content.languageLabel}</p>
          <div className="inline-flex rounded-xl bg-[#E8E8ED] p-1 dark:bg-[#0B1120]" role="group" aria-label={content.languageLabel}>
            {[["th", "ไทย"], ["en", "EN"]].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => changeLanguage(value)}
                aria-pressed={language === value}
                className={`min-h-10 rounded-lg px-4 text-sm font-bold transition-all duration-200 ${language === value ? "bg-white text-[#111827] shadow-sm dark:bg-[#263042] dark:text-white" : "text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-[#111827] dark:text-white">{content.featuresTitle}</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {content.features.map((feature) => {
            const needsAccount = feature.access === "account"
            return (
              <article key={feature.title} className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-5 dark:border-[#263042] dark:bg-[#151B2D]">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-[#0B1120] dark:text-blue-400">
                    <GuideIcon name={feature.icon} />
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${needsAccount ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"}`}>
                    <span aria-hidden="true">{needsAccount ? "🔒" : "✓"}</span>
                    {needsAccount ? content.signInRequired : content.availableNow}
                  </span>
                </div>
                <h4 className="mt-4 font-bold text-[#111827] dark:text-white">{feature.title}</h4>
                <p className="mt-1 leading-7 text-[#374151] dark:text-[#D1D5DB]">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-[#111827] dark:text-white">{content.stepsTitle}</h3>
        <ol className="mt-4 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
          {content.steps.map((step, index) => (
            <li key={step.title} className="flex min-w-0 gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 sm:p-5 dark:border-[#263042] dark:bg-[#151B2D]">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-white dark:bg-white dark:text-[#111827]">
                <GuideIcon name={step.icon} className="h-5 w-5" />
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white ring-2 ring-[#F7F8FC] dark:ring-[#151B2D]">{index + 1}</span>
              </span>
              <div className="min-w-0">
                <h4 className="font-semibold text-[#111827] dark:text-white">{step.title}</h4>
                <p className="mt-1 text-base leading-7 text-[#374151] dark:text-[#D1D5DB]">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 min-w-0 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FC] p-4 sm:p-5 dark:border-[#263042] dark:bg-[#151B2D]">
        <h3 className="text-lg font-bold text-[#111827] dark:text-white">{content.supportedTitle}</h3>
        <div className="mt-4 grid gap-3 text-base font-medium text-[#374151] md:grid-cols-3 dark:text-[#D1D5DB]">
          {content.supportedItems.map((item) => (
            <p key={item.text} className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 dark:border-[#263042] dark:bg-[#0B1120]">
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${item.state === "yes" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"}`} aria-hidden="true">
                {item.state === "yes" ? "✓" : "×"}
              </span>
              <span>{item.text}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-base leading-7 text-[#374151] dark:border-[#263042] dark:bg-[#151B2D] dark:text-[#D1D5DB]">
        <span className="font-semibold text-[#111827] dark:text-white">{content.tipLabel}</span>{" "}{content.tip}
      </div>
    </section>
  )
}

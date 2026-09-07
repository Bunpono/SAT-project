const FEEDBACK_FORM_URL = "https://forms.gle/XtAP7pw2pTfvEaLV8"

function FeedbackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M7 3.5h10A2.5 2.5 0 0 1 19.5 6v12A2.5 2.5 0 0 1 17 20.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Zm2 0h6v3H9v-3Zm0 7h6m-6 4h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export default function FeedbackPrompt() {
  return (
    <aside
      aria-labelledby="feedback-title"
      className="mt-5 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-[0_18px_50px_rgba(37,99,235,0.08)] transition-colors duration-300 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6 dark:border-blue-900/80 dark:from-[#111827] dark:to-[#172554]"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm dark:bg-blue-500">
          <FeedbackIcon />
        </span>
        <div>
          <h2 id="feedback-title" className="text-lg font-bold text-[#111827] dark:text-white">
            ทดลองใช้แล้ว ช่วยประเมินระบบให้เราด้วยนะคะ
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#4B5563] dark:text-[#D1D5DB]">
            ความคิดเห็นของคุณจะช่วยพัฒนาระบบ ใช้เวลาประมาณ 1 นาที และไม่เก็บชื่อหรืออีเมล
          </p>
        </div>
      </div>

      <a
        href={FEEDBACK_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-base font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:mt-0 sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-900"
      >
        ประเมินระบบหลังทดลองใช้
        <span className="ml-2" aria-hidden="true">↗</span>
      </a>
    </aside>
  )
}

export { FEEDBACK_FORM_URL }

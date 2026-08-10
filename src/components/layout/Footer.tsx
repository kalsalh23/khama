import { Link } from "react-router-dom"
import { GraduationCap, Instagram, Twitter, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                <GraduationCap className="size-5" />
              </div>
              <span className="text-xl font-bold text-white">خاما</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              منصة تصميم أزياء التخرج الشخصية. صمّم وشاحك وروبك وقبعتك بنفسك، اختر الألوان وأضف اسمك وعبارتك وشاهد النتيجة قبل الطلب.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-colors hover:bg-amber-500 hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">المنتجات</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products/scarf" className="hover:text-amber-400">وشاح التخرج</Link></li>
              <li><Link to="/products/robe" className="hover:text-amber-400">روب التخرج</Link></li>
              <li><Link to="/products/cap" className="hover:text-amber-400">قبعة التخرج</Link></li>
              <li><Link to="/products/set" className="hover:text-amber-400">طقم التخرج</Link></li>
              <li><Link to="/designer/scarf" className="hover:text-amber-400">مصمم الوشاح</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/measurements" className="hover:text-amber-400">دليل القياسات</Link></li>
              <li><Link to="/blog" className="hover:text-amber-400">المدونة</Link></li>
              <li><Link to="/faq" className="hover:text-amber-400">الأسئلة الشائعة</Link></li>
              <li><Link to="/page/shipping-policy" className="hover:text-amber-400">سياسة الشحن</Link></li>
              <li><Link to="/page/returns-policy" className="hover:text-amber-400">سياسة الاستبدال</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">تواصل معنا</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/page/contact" className="hover:text-amber-400">اتصل بنا</Link></li>
              <li><Link to="/page/privacy-policy" className="hover:text-amber-400">سياسة الخصوصية</Link></li>
              <li><Link to="/page/terms" className="hover:text-amber-400">الشروط والأحكام</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} خاما. جميع الحقوق محفوظة.</p>
          <p>صُمّم بحب لتخرجك</p>
        </div>
      </div>
    </footer>
  )
}

"""Apply the shared navigation shell to the static, editable HTML pages."""
from pathlib import Path
import json,re,html
ROOT=Path(__file__).resolve().parents[1];PAGES=ROOT/'src/pages'
company=json.loads((ROOT/'src/data/company-pages.json').read_text())
company_by_file={str((ROOT/r['file']).resolve()):r for r in company}
def navigation(lang):
 fa=lang=='fa';pre='/' if fa else '/en/'
 def tr(a,b):return a if fa else b
 def href(slug):return pre+slug+'/'
 def archive(route):return ('/fa'+route) if fa else route
 company=[(href('about'),tr('دربارهٔ ما','About us')),(href('team'),tr('تیم ما','Our team')),(href('careers'),tr('فرصت‌های همکاری','Careers')),(href('contact'),tr('تماس با ما','Contact'))]
 services=[(archive('/services/'),tr('نمای کلی خدمات','Services overview')),(href('services/road-freight'),tr('حمل زمینی','Road freight')),(href('services/air-freight'),tr('حمل هوایی','Air freight')),(href('services/ocean-freight'),tr('حمل دریایی','Ocean freight')),(archive('/logistics/'),tr('لجستیک','Logistics')),(archive('/shipment/'),tr('محموله','Shipment'))]
 projects=[(archive('/case-studies/'),tr('نمونه‌کارها','Case studies')),(archive('/portfolios/'),tr('پروژه‌ها','Projects'))]
 information=[(href('faq'),tr('پرسش‌های متداول','FAQ')),(href('privacy-policy'),tr('حریم خصوصی','Privacy policy')),(href('terms'),tr('شرایط استفاده','Terms of use'))]
 return company, services, projects, information

def shell(lang):
 fa=lang=='fa';pre='/' if fa else '/en/'
 def tr(a,b):return a if fa else b
 def href(slug):return pre+slug+'/' if slug else ('/fa/' if fa else '/')
 def link(target,label):return '<a href="'+target+'">'+label+'</a>'
 def dropdown(label,items):
  return '<div class="bm-dropdown"><button class="bm-drop-toggle" type="button" aria-expanded="false">'+label+'<span aria-hidden="true" class="bm-chevron"></span></button><div class="bm-dropdown-panel">'+''.join(link(path,text) for path,text in items)+'</div></div>'
 company, services, projects, information = navigation(lang)
 nav=link(href(''),tr('خانه','Home'))+dropdown(tr('شرکت','Company'),company)+dropdown(tr('خدمات','Services'),services)+dropdown(tr('پروژه‌ها','Projects'),projects)+dropdown(tr('راهنما','Information'),information)+link(href('contact'),tr('تماس','Contact'))
 return '<header class="bm-header"><div class="bm-header-inner"><a class="bm-logo" href="'+href('')+'">'+tr('بارمانا','BARMANA')+'</a><nav id="bm-mobile-navigation" class="bm-inline-nav" aria-label="'+tr('منوی اصلی','Main navigation')+'">'+nav+'</nav><a class="bm-quote" href="'+href('request-quote')+'">'+tr('درخواست قیمت','Request a quote')+'</a><button type="button" class="bm-mobile-toggle" aria-expanded="false" aria-label="'+tr('باز کردن منو','Open menu')+'" aria-controls="bm-mobile-navigation"><span></span><span></span><span></span></button></div></header>'

def select(lang,fa_path,en_path):
 return '<label class="bm-language"><span>'+('زبان' if lang=='fa' else 'Language')+'</span><select aria-label="'+('انتخاب زبان' if lang=='fa' else 'Select language')+'"><option value="'+html.escape(fa_path,quote=True)+'"'+(' selected' if lang=='fa' else '')+'>فارسی</option><option value="'+html.escape(en_path,quote=True)+'"'+(' selected' if lang=='en' else '')+'>English</option></select></label>'
def footer(lang, fa_path, en_path):
 fa = lang == 'fa'
 def tr(fa_text, en_text):
  return fa_text if fa else en_text
 home, prefix = ('/fa/', '/') if fa else ('/', '/en/')
 company, services, projects, information = navigation(lang)
 faq, privacy, terms = information
 def links(items):
  return ''.join(f'<a href="{path}">{label}</a>' for path, label in items)
 groups = (
  (tr('شرکت','Company'), company + projects),
  (tr('خدمات','Services'), services),
  (tr('لینک‌های کاربردی','Useful links'), [(prefix+'request-quote/',tr('درخواست قیمت','Request a quote')), faq, (home,tr('خانه','Home'))]),
 )
 columns = ''.join(f'<div class="bm-footer-links"><h3>{title}</h3>{links(items)}</div>' for title, items in groups)
 name = tr('بارمانا','BARMANA')
 return f'''<footer class="bm-site-footer">
  <div class="bm-footer-wrap">
   <div class="bm-footer-top">
    <div>
     <a class="bm-footer-brand" href="{home}"><img src="/assets/images/barmana-mark.svg" alt=""><span>{name}<small lang="en">SHIPPING &amp; LOGISTICS</small></span></a>
     <p>{tr('مسیر مناسب، اطلاعات روشن و هماهنگی در هر مرحله.','The right route. Clear information. Coordination at every step.')}</p>
     <address><strong>{tr('دفتر تهران','Tehran office')}</strong><br>{tr('ایران، تهران، خیابان گاندی، کوچهٔ پنجم، پلاک ۲۲، طبقهٔ اول','First Floor, No. 22, 5th Alley, Gandhi Street, Tehran, Iran')}</address>
     <div class="bm-footer-contact"><a href="tel:+982159184444" dir="ltr">+98 21 5918 4444</a><a href="mailto:info@barmana.co">info@barmana.co</a></div>
    </div>
    {columns}
   </div>
   <div class="bm-footer-bottom">
    {select(lang,fa_path,en_path)}
    <span>© {name} · {tr('حمل‌ونقل و لجستیک','Shipping &amp; logistics')}</span>
    <nav aria-label="{tr('اطلاعات حقوقی','Legal information')}">{links([privacy,terms])}</nav>
   </div>
  </div>
 </footer>'''

for p in PAGES.rglob('*.html'):
 s=p.read_text();rec=company_by_file.get(str(p.resolve()));lang=rec['language'] if rec else ('fa' if '/fa/' in str(p) else 'en')
 s=re.sub(r'<header class="bm-header">.*?</header>','',s,flags=re.S)
 s=re.sub(r'<link\b[^>]*href="/assets/custom/shared\.css"[^>]*>','',s)
 s=re.sub(r'<script\b[^>]*src="/assets/custom/shared\.js"[^>]*></script>','',s)
 s=re.sub(r'<div class="bm-archive-footer-language">.*?</div>','',s,flags=re.S)
 s=re.sub(r'<label class="bm-language">.*?</label>','',s,flags=re.S)
 s=s.replace('</head>','<link rel="stylesheet" href="/assets/custom/shared.css"><script src="/assets/custom/shared.js" defer></script></head>',1)
 s=re.sub(r'(<body\b[^>]*>)',lambda m:m.group(1)+shell(lang),s,count=1)
 if rec:
  route=rec['route'];slug=route.removeprefix('/en/').strip('/') if lang=='en' else route.strip('/')
  fa_path='/'+slug+'/';en_path='/en/'+slug+'/'
 else:
  rel='/' if p==PAGES/'index.html' else '/'+str(p.relative_to(PAGES).parent).strip('/')+'/'
  if rel in ['/','/home/','/home-alt-2/','/en/','/fa/']:fa_path='/fa/';en_path='/'
  elif rel.startswith('/fa/'):fa_path=rel;en_path=rel[3:]
  else:fa_path='/fa'+rel;en_path=rel
 s=re.sub(r'<footer\b.*?</footer>',lambda _:footer(lang,fa_path,en_path),s,count=1,flags=re.S)
 p.write_text(s)
print('Shared shell applied.')

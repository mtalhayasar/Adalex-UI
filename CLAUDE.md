# CLAUDE.md - Adalex UI Kütüphanesi Geliştirme Talimatları

## Proje Bağlamı

Bu bir Django UI bileşen kütüphanesi monorepo'sudur. Taşınabilir, yeniden kullanılabilir bileşenler üretiyoruz.

**Amaç**: Tek bir design token sistemi ile yönetilen, farklı Django projelerine kolayca entegre edilebilen UI kütüphanesi.

## Teknik Stack

- **Backend**: Django 4.x+
- **Templating**: Django Templates
- **CSS**: SCSS → CSS (design tokens tabanlı)
- **JS**: Vanilla JavaScript (modüler, HTMX uyumlu)
- **Build**: npm/Node.js (SCSS derleme)
- **Test**: pytest-django

## Proje Yapısı

```
adalex-ui/
├── adalex_ui/           # Ana Django app (reusable)
│   ├── templates/       # Django templates (components, layouts)
│   ├── static/a-ui/     # CSS, JS, assets
│   └── utils.py         # Python utilities
├── examples/playground/ # Demo Django projesi
│   └── templates/demo/  # Minimal demo pages (visual only)
├── docs/                # Kapsamlı dokümantasyon
│   └── COMPONENTS.md    # Tüm bileşenlerin API referansı
└── tests/               # Test suite
```

## Temel İlkeler

### 1. Design Tokens
- **Tüm renkler/gölgeler CSS değişkenlerinden gelmelidir**
- **ASLA hard-coded renk değerleri kullanma (hex, rgb, rgba, hsl)**
- `_tokens.scss` tek kaynak dosyadır - tüm renkler buradan yönetilir
- **Semantic token sistemi**: `--error-main`, `--success-light`, `--warning-border` vb. kullan
- **Focus ring sistemi**: `--focus-ring-primary`, `--focus-ring-error` vb. kullan
- **Gradient varyantları**: `--primary-gradient-hover`, `--secondary-gradient-active` vb. kullan
- **Interactive overlays**: `--button-hover-overlay`, `--modal-backdrop` vb. kullan

### 2. Taşınabilirlik
- Bileşenler `INSTALLED_APPS` + `{% include %}` ile çalışmalı
- Dış bağımlılıkları minimumda tut
- Sıfır kod değişikliği ile taşınabilir olsun

### 3. Erişilebilirlik
- Her form elementi `label[for]` + `id` ilişkili olmalı
- ARIA attributes ekle (role, aria-*)
- Klavye navigasyonu destekle
- Kontrast oranlarını koru

### 4. HTMX Uyumluluğu
- JS modülleri idempotent init (tekrar bağlanabilir)
- Event delegation kullan
- `htmx:afterSwap` sonrası re-initialize

### 5. BEM Benzeri Naming
- `.a-component-name` (block)
- `.a-component-name__element` (element)
- `.a-component-name--variant` (modifier)

### 6. Modüler Bileşen Mimarisi
- **Küçük vs Büyük Bileşenler**: Proje iki seviyeli bileşen sistemine sahiptir
  - **Küçük bileşenler**: Tek amaçlı, yeniden kullanılabilir (button.html, text_input.html, icon.html gibi)
  - **Büyük bileşenler**: Birden fazla küçük bileşen içeren kompozit yapılar (form.html, navbar.html, dashboard.html gibi)
- **Mutlak Kural**: Büyük bileşenler **SADECE** küçük bileşenleri kullanmalı, inline HTML yazmamalı
- **Tek Yerden Değişim**: Küçük bir bileşeni değiştirdiğinde tüm kullanıldığı yerlerde otomatik değişmeli
- **Yeniden Kullanım**: Aynı element türü her yerde aynı küçük bileşenle çalışmalı

### 7. Dokümantasyon Yaklaşımı
- **Demo sayfaları**: Minimal, sadece görsel showcase
  - Başlık + kısa açıklama + bileşen örnekleri
  - **ASLA** parametreleri, kullanım kodlarını demo'ya yazma
- **Dokümantasyon**: `docs/COMPONENTS.md`'de kapsamlı API referansı
  - Tüm parametreler tablo formatında
  - Kullanım örnekleri (Django template kodu)
  - Best practices ve erişilebilirlik notları
- **Separation of concerns**: Demo = görsel, Docs = teknik detay

## Komutlar

```bash
# CSS derleme
npm run css:build    # Production build
npm run css:watch    # Development watch

# Django playground
cd examples/playground
python manage.py runserver

# Test
pytest
```

## Geliştirme Workflow

### Her Task'ta Şunları Yap:

1. **Proje Bütünlüğünü Koru**
   - Her task sonrası projenin tamamını gözden geçir
   - Önceki task'ların çıktılarıyla uyumlu çalış
   - Tutarlılığı kontrol et (naming, structure, style)

2. **Token'ları Kullan**
   - SCSS'te `var(--token-name)` kullan
   - Yeni renk/gölge ekleme, mevcut token'ları kullan

3. **Templatetags Kontrol Et**
   - `{% load a_ui_tags %}` eklemeyi unutma
   - Parametreleri dokümante et

4. **Playground'a Ekle**
   - Her bileşen için minimal demo sayfası oluştur
   - Sadece başlık + kısa açıklama + görsel demo
   - URL, view, template üçlüsünü tamamla
   - **Parametreleri demo'ya yazma** - docs/ altında dökümante et

5. **Import'ları Güncelle**
   - `main.scss`'ye component stil dosyasını ekle
   - `main.js`'ye component JS'ini ekle

6. **Dokümantasyonu Güncelle**
   - Yeni bileşen için `docs/COMPONENTS.md`'ye ekle
   - Tüm parametreleri, kullanım örneklerini ve best practice'leri yaz

## Kod Standartları

### Python/Django
- PEP 8 stiline uy
- Docstring'ler Google stili
- Type hints kullan (Python 3.9+)

### HTML/Templates
- 2 space indentation
- Self-closing tag'lerde boşluk: `<br />`
- Attribute sırası: class, id, data-*, aria-*, diğerleri
- **Django yorumları kullanma** - `{# ... #}` yorumları bazı durumlarda HTML'de görünebilir

### SCSS
- 2 space indentation
- Nesting 3 seviyeden fazla olmasın
- Mixin/function'ları `_utilities.scss`'te topla

### JavaScript
- ES6+ syntax
- `const` > `let` > `var`
- Event delegation tercih et
- Init fonksiyonları idempotent olmalı

## Subagent Kullanımı

**Ne Zaman Kullan:**
- Karmaşık bileşenlerde (5+ dosya değişikliği)
- Test yazımı ve code review için
- Dokümantasyon güncelleme için

**Nasıl Kullan:**
```
Ana task'ı böl:
1. Subagent 1: Template + SCSS üret
2. Subagent 2: JS davranışı ekle
3. Subagent 3: Playground demo oluştur
4. Ana agent: Entegrasyonu doğrula
```

## Kısıtlamalar

### YAPMA:
- ❌ **Hard-coded renk değerleri** (hex: #ffffff, rgb: rgb(255,0,0), rgba: rgba(0,0,0,0.5), hsl: hsl(0,100%,50%))
- ❌ **Gradientlerde hard-coded renkler** - gradient token'ları kullan
- ❌ **Focus ring'lerde hard-coded box-shadow** - `--focus-ring-*` token'ları kullan
- ❌ **Modal backdrop'larda hard-coded rgba** - `--modal-backdrop` kullan
- ❌ `!important` kullanma (son çare hariç)
- ❌ Inline style attribute'ları
- ❌ Global JS namespace kirliliği
- ❌ Erişilebilirlik olmadan bileşen yayınlama
- ❌ Django template yorumları `{# ... #}` - HTML'de görünebilir
- ❌ **Büyük bileşenlerde inline HTML yazma** - Mutlaka küçük bileşenleri kullan

### YAP:
- ✅ **Design token'ları kullan** - `var(--token-name)` formatında
- ✅ **Semantic renk sistemi** - `--error-main`, `--success-light`, `--warning-border`
- ✅ **Focus ring token'ları** - `--focus-ring-primary`, `--focus-ring-error`
- ✅ **Gradient token'ları** - `--primary-gradient-hover`, `--secondary-gradient-active`
- ✅ **Interactive overlay'ler** - `--button-hover-overlay`, `--button-active-overlay`
- ✅ Semantic HTML
- ✅ Progressive enhancement
- ✅ Mobile-first responsive
- ✅ Her bileşeni test et
- ✅ **Büyük bileşenleri küçük bileşenlerden oluştur** - Modüler mimariye uy

## Kalite Kontrol Checklist

Her bileşen tamamlandığında kontrol et:

- [ ] **Design token'ları kullanılıyor mu?** (hiç hard-coded renk yok mu?)
- [ ] **Semantic renk sistemi** - Error, success, warning, info renkleri token'lardan mı?
- [ ] **Focus ring token'ları** - Hard-coded rgba box-shadow yok mu?
- [ ] **Gradient token'ları** - Hard-coded gradient değerleri yok mu?
- [ ] **Interactive overlay'ler** - Hover/active için token kullanılıyor mu?
- [ ] ARIA attributes eklenmiş mi?
- [ ] Klavye erişimi sağlanmış mı?
- [ ] Hover/focus/active durumları var mı?
- [ ] HTMX swap sonrası çalışıyor mu?
- [ ] **Büyük bileşen ise küçük bileşenleri kullanıyor mu?**
- [ ] **Inline HTML yazılmış mı? (büyük bileşenlerde yasak)**
- [ ] Playground'da minimal demo var mı? (sadece görsel)
- [ ] `docs/COMPONENTS.md`'de API referansı var mı?
- [ ] Tüm parametreler dokümante edilmiş mi?
- [ ] Kullanım örnekleri eklenmiş mi?
- [ ] SCSS main.scss'ye import edilmiş mi?
- [ ] JS main.js'ye dahil edilmiş mi?

## Task İlerlemesi

Her task'ı bitirdiğinde:

1. **Dosya yapısını kontrol et**: Tüm dosyalar doğru yerde mi?
2. **Entegrasyonu doğrula**: Yeni kod mevcut yapıyla uyumlu mu?
3. **Test et**: Manuel veya otomatik test yap
4. **Playground demo'yu temizle**: Parametreleri/usage blokları kaldır
5. **Dokümante et**: `docs/COMPONENTS.md` güncelle
6. **CSS derle**: `npm run css:build` çalıştır
7. **Bir sonraki task'a hazırla**: Gerekli context'i not et

## Hata Ayıklama

### SCSS derlenmiyorsa:
```bash
npm install
npm run css:build
```

### Static dosyalar yüklenmiyor:
```bash
python manage.py collectstatic --noinput
```

### Template bulunamıyor:
- `INSTALLED_APPS`'te `'adalex_ui'` var mı kontrol et
- Template path doğru mu: `components/...`

## Notlar

- **Bağlam yönetimi**: Uzun task'larda `/compact` kullan
- **Belirsizlik varsa**: Plan yap, onay al, sonra kodla
- **Karmaşık değişiklikler**: Subagent kullanmayı düşün
- **Her zaman geri dön**: Projeyi bütün olarak düşün
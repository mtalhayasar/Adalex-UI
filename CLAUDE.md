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
- Hard-coded renk değerleri kullanma
- `_tokens.scss` tek kaynak dosyadır

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

### 6. Dokümantasyon Yaklaşımı
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
- ❌ Hard-coded renk değerleri
- ❌ `!important` kullanma (son çare hariç)
- ❌ Inline style attribute'ları
- ❌ Global JS namespace kirliliği
- ❌ Erişilebilirlik olmadan bileşen yayınlama

### YAP:
- ✅ Design token'ları kullan
- ✅ Semantic HTML
- ✅ Progressive enhancement
- ✅ Mobile-first responsive
- ✅ Her bileşeni test et

## Kalite Kontrol Checklist

Her bileşen tamamlandığında kontrol et:

- [ ] Design token'ları kullanılıyor mu?
- [ ] ARIA attributes eklenmiş mi?
- [ ] Klavye erişimi sağlanmış mı?
- [ ] Hover/focus/active durumları var mı?
- [ ] HTMX swap sonrası çalışıyor mu?
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
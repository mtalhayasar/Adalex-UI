# Branch Protection Kurulum Kılavuzu

Bu dokümantasyon, GitHub repository'sinde branch protection kurallarının nasıl ayarlanacağını açıklar.

## 🔒 GitHub'da Branch Protection Ayarlama

### Adım 1: Repository Settings'e Gidin
1. GitHub'da repository sayfasına gidin: `https://github.com/mtalhayasar/Adalex-UI`
2. **Settings** sekmesine tıklayın (üst menüde)

### Adım 2: Branch Protection Rules Bölümüne Gidin
1. Sol menüden **Branches** seçeneğine tıklayın
2. "Branch protection rules" bölümünü bulun
3. **Add rule** butonuna tıklayın

### Adım 3: Protection Kurallarını Ayarlayın

**Branch name pattern** alanına: `main` yazın

Aşağıdaki seçenekleri işaretleyin:

#### Zorunlu Ayarlar (Önerilen)
- [x] **Require a pull request before merging**
  - PR olmadan doğrudan push engellenecek
  - [x] **Require approvals** (1 onay gerekli)
  - [x] **Dismiss stale pull request approvals when new commits are pushed**

#### Force Push ve Silme Koruması
- [ ] **Allow force pushes** - İŞARETLEMEYİN (devre dışı bırakın)
- [ ] **Allow deletions** - İŞARETLEMEYİN (devre dışı bırakın)

#### Ek Güvenlik (Opsiyonel)
- [x] **Require status checks to pass before merging**
  - CI/CD kontrollerinin geçmesi gerekir
- [x] **Require conversation resolution before merging**
  - Tüm yorumların çözülmesi gerekir
- [x] **Do not allow bypassing the above settings**
  - Admin dahil herkes kurallara uymak zorunda

#### Push Kısıtlaması
- [x] **Restrict who can push to matching branches**
  - Sadece belirlenen kullanıcılar push yapabilir
  - Kendinizi (@mtalhayasar) ekleyin

### Adım 4: Kaydedin
**Create** veya **Save changes** butonuna tıklayın.

---

## 📁 Bu Repository'de Eklenen Korumalar

### CODEOWNERS Dosyası
`.github/CODEOWNERS` dosyası tüm değişiklikler için `@mtalhayasar` kullanıcısının onayını gerektirir.

### Branch Protection Workflow
`.github/workflows/branch-protection.yml` PR'larda otomatik kontrol yapar.

---

## ⚠️ Önemli Notlar

1. **Branch protection ayarları GitHub'ın sunucu tarafında yapılır** - Sadece kod değişikliği ile aktif olmaz.

2. **CODEOWNERS çalışması için** branch protection'da "Require review from Code Owners" seçeneğinin aktif olması gerekir.

3. **Sadece repository sahibi veya admin yetkisine sahip kullanıcılar** branch protection kuralları ekleyebilir.

---

## 🔗 Yararlı Linkler

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CODEOWNERS Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

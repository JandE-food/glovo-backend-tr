## 1. Mimari Tasarim
```mermaid
flowchart LR
    A["Expo React Native Uygulamasi"] --> B["Gezinme Katmani"]
    B --> C["Ekranlar ve Bilesenler"]
    C --> D["Durum Yonetimi"]
    D --> E["Axios API Istemcisi"]
    E --> F["Express + Socket.io Backend"]
    F --> G["MongoDB"]
    E --> H["Stripe Turkiye"]
    C --> I["i18next Ceviri Katmani"]
    C --> J["expo-location"]
```

## 2. Teknoloji Aciklamasi
- Mobil uygulama: React Native + Expo + TypeScript
- Gezinme: `@react-navigation/native`, alt sekmeler ve stack navigasyonu
- Ag katmani: `axios`
- Konum servisleri: `expo-location`
- Coklu dil altyapisi: `i18next` + `react-i18next`
- Stil sistemi: React Native `StyleSheet` yapisi, tema sabitleri ile renk yonetimi
- Backend entegrasyonu: Node.js + Express + Socket.io + MongoDB
- Odeme entegrasyonu: Stripe Turkiye (kart ve QR kod akisi)

## 3. Rota Tanimlari
| Rota | Amac |
|------|------|
| Login | Kullanici girisi |
| Signup | Yeni hesap olusturma |
| Home | Kategori ve restoran listesi |
| Restaurant | Secili restoranin menu detaylari |
| Cart | Sepet ve toplam tutar |
| Orders | Siparis gecmisi ve durumlari |
| Address | Kayitli adresleri yonetme |

## 4. API Tanimlari
```ts
type GirisIstek = {
  email: string;
  sifre: string;
};

type KayitIstek = {
  adSoyad: string;
  email: string;
  sifre: string;
  telefon: string;
};

type Restoran = {
  id: string;
  ad: string;
  kategori: string;
  puan: number;
  teslimatSuresi: string;
  gorselUrl: string;
};

type MenuUrunu = {
  id: string;
  ad: string;
  fiyat: number;
  aciklama?: string;
};

type SepetKalemi = {
  urunId: string;
  ad: string;
  fiyat: number;
  adet: number;
};

type Adres = {
  mahalle: string;
  sokak: string;
  apartman: string;
  kat: string;
  daire: string;
  postaKodu: string;
};
```

## 5. Sunucu Mimari Diyagrami
```mermaid
flowchart TD
    A["Mobil Uygulama"] --> B["REST Controller"]
    B --> C["Servis Katmani"]
    C --> D["Repository Katmani"]
    D --> E["MongoDB"]
    C --> F["Socket.io Gercek Zamanli Guncellemeler"]
    C --> G["Stripe Odeme Servisi"]
```

## 6. Veri Modeli
### 6.1 Veri Modeli Tanimi
```mermaid
erDiagram
    KULLANICI ||--o{ SIPARIS : "olusturur"
    KULLANICI ||--o{ ADRES : "kaydeder"
    RESTORAN ||--o{ MENU_URUNU : "sunar"
    SIPARIS ||--|{ SIPARIS_KALEMI : "icerir"
    MENU_URUNU ||--o{ SIPARIS_KALEMI : "sipariste yer alir"

    KULLANICI {
        string id
        string adSoyad
        string email
        string telefon
    }
    ADRES {
        string id
        string mahalle
        string sokak
        string apartman
        string kat
        string daire
        string postaKodu
    }
    RESTORAN {
        string id
        string ad
        string kategori
        float puan
    }
    MENU_URUNU {
        string id
        string ad
        float fiyat
    }
    SIPARIS {
        string id
        string durum
        float toplam
    }
    SIPARIS_KALEMI {
        string id
        int adet
        float birimFiyat
    }
```

### 6.2 Veri Tanimlama Notlari
- Ilk surum icin istemci tarafinda mock veri ile baslanir
- Siparis durumlari: `Hazirlaniyor`, `Yolda`, `Teslim Edildi`, `Iptal Edildi`
- Para birimi tum hesaplamalarda `TRY` olarak tutulur, arayuzde `₺` ile gosterilir
- Adres modeli Istanbul adres bicimi ile bire bir uyumludur: Mahalle, Sokak, Apartman, Kat, Daire, Posta Kodu

export interface LocationData {
  postalCodes: string[];
  cities: Record<
    string,
    {
      postalCodes: string[];
      kecamatan: Record<string, string[]>;
    }
  >;
}

export const LOCATIONS: Record<string, LocationData> = {
  "DKI Jakarta": {
    postalCodes: ["10110", "10220", "10310", "10430", "10510"],
    cities: {
      "Jakarta Pusat": {
        postalCodes: ["10110", "10220", "10310"],
        kecamatan: {
          Gambir: ["Gambir", "Cideng", "Petojo Selatan", "Kebon Kelapa"],
          Menteng: ["Menteng", "Cikini", "Gondangdia", "Pegangsaan"],
          "Tanah Abang": ["Bendungan Hilir", "Karet Tengsin", "Kebon Melati", "Petamburan"],
        },
      },
      "Jakarta Selatan": {
        postalCodes: ["12110", "12210", "12310", "12430"],
        kecamatan: {
          "Kebayoran Baru": ["Senayan", "Melawai", "Gunung", "Kramat Pela"],
          Cilandak: ["Cilandak Barat", "Lebak Bulus", "Gandaria Selatan", "Cipete Selatan"],
          Tebet: ["Tebet Barat", "Tebet Timur", "Manggarai", "Menteng Dalam"],
        },
      },
      "Jakarta Barat": {
        postalCodes: ["11110", "11210", "11310", "11470"],
        kecamatan: {
          "Grogol Petamburan": ["Grogol", "Tanjung Duren Selatan", "Jelambar", "Tomang"],
          Palmerah: ["Palmerah", "Kemanggisan", "Slipi", "Kota Bambu Selatan"],
          "Kebon Jeruk": ["Kebon Jeruk", "Duri Kepa", "Kedoya Selatan", "Sukabumi Selatan"],
        },
      },
    },
  },
  "Jawa Barat": {
    postalCodes: ["40111", "40211", "40311", "40511"],
    cities: {
      Bandung: {
        postalCodes: ["40111", "40211", "40311"],
        kecamatan: {
          Coblong: ["Dago", "Lebakgede", "Sekeloa", "Ciumbuleuit"],
          Cicendo: ["Pasirkaliki", "Arjuna", "Pajajaran", "Husen Sastranegara"],
          "Bandung Wetan": ["Citarum", "Cihapit", "Tamansari", "Garuda"],
        },
      },
      Bekasi: {
        postalCodes: ["17111", "17121", "17131"],
        kecamatan: {
          "Bekasi Timur": ["Aren Jaya", "Bekasi Jaya", "Duren Jaya", "Margahayu"],
          "Bekasi Selatan": ["Jaka Sampurna", "Jaka Setia", "Pekayon Jaya", "Margahayu"],
          "Medan Satria": ["Medan Satria", "Pejuang", "Kranji", "Kaliabang Tengah"],
        },
      },
      Depok: {
        postalCodes: ["16411", "16415", "16418"],
        kecamatan: {
          "Sawangan": ["Sawangan", "Kedaung", "Pengasinan", "Bedahan"],
          Cimanggis: ["Tugu", "Cisalak Pasar", "Harjamukti", "Curug"],
          Sukmajaya: ["Sukmajaya", "Abadijaya", "Mekarjaya", "Baktijaya"],
        },
      },
    },
  },
  "Jawa Tengah": {
    postalCodes: ["50111", "50211", "50311"],
    cities: {
      Semarang: {
        postalCodes: ["50111", "50211", "50311"],
        kecamatan: {
          "Semarang Tengah": ["Pekunden", "Kauman", "Pandansari", "Brumbungan"],
          Candisari: ["Jatingaleh", "Kaliwiru", "Wonotingal", "Tegalsari"],
          Gayamsari: ["Gayamsari", "Sambirejo", "Karangtempel", "Siwalan"],
        },
      },
      Surakarta: {
        postalCodes: ["57111", "57121", "57131"],
        kecamatan: {
          Laweyan: ["Kerten", "Pajang", "Panularan", "Sondakan"],
          Banjarsari: ["Kadipiro", "Nusukan", "Banyuanyar", "Keprabon"],
          Jebres: ["Jebres", "Kepatihan Wetan", "Mojosongo", "Kemlayan"],
        },
      },
      Magelang: {
        postalCodes: ["56111", "56121", "56123"],
        kecamatan: {
          "Magelang Utara": ["Kramat Utara", "Potrobangsan", "Rejowinangun Utara", "Cacaban"],
          "Magelang Tengah": ["Kemirirejo", "Magelang", "Rejowinangun", "Tidar Utara"],
          "Magelang Selatan": ["Jurangombo Selatan", "Tidar Selatan", "Magersari", "Mertoyudan"],
        },
      },
    },
  },
  "Jawa Timur": {
    postalCodes: ["60111", "60211", "60311"],
    cities: {
      Surabaya: {
        postalCodes: ["60111", "60211", "60311"],
        kecamatan: {
          Genteng: ["Genteng", "Embong Kaliasin", "Ketabang", "Peneleh"],
          Sukolilo: ["Keputih", "Ngiden Jangkungan", "Semolowaru", "Medokan Semampir"],
          Wonokromo: ["Wonokromo", "Jagir", "Ngagel", "Darmo"],
        },
      },
      Malang: {
        postalCodes: ["65111", "65112", "65115"],
        kecamatan: {
          Klojen: ["Klojen", "Kauman", "Penanggungan", "Gading Kasri"],
          Lowokwaru: ["Lowokwaru", "Tulusrejo", "Tunjungsekar", "Tasikmadu"],
          Sukun: ["Bakalan Krajan", "Cemorokandang", "Madyopuro", "Sukun"],
        },
      },
      Sidoarjo: {
        postalCodes: ["61211", "61212", "61213"],
        kecamatan: {
          Sidoarjo: ["Sidokumpul", "Sidoklumpuk", "Sidokerto", "Sidogiri"],
          Buduran: ["Buduran", "Siweru", "Pagerwojo", "Sukodono"],
          Waru: ["Waru", "Wadungasih", "Kureksari", "Pesawahan"],
        },
      },
    },
  },
  "Banten": {
    postalCodes: ["15111", "15121", "15131"],
    cities: {
      Tangerang: {
        postalCodes: ["15111", "15121", "15131"],
        kecamatan: {
          Tangerang: ["Babakan", "Buaran Indah", "Cikokol", "Sukasari"],
          Karawaci: ["Karawaci", "Bojong Jaya", "Cimone", "Sukajadi"],
          Cipondoh: ["Cipondoh", "Kenanga", "Petir", "Ketapang"],
        },
      },
      "Tangerang Selatan": {
        postalCodes: ["15310", "15311", "15312"],
        kecamatan: {
          Serpong: ["Serpong", "Lengkong Gudang", "Rawa Buntu", "Jelupang"],
          Ciputat: ["Ciputat", "Cipayung", "Jombang", "Sawah Baru"],
          Pamulang: ["Pamulang Barat", "Pamulang Timur", "Bambu Apus", "Pondok Benda"],
        },
      },
    },
  },
  "DI Yogyakarta": {
    postalCodes: ["55111", "55211", "55311"],
    cities: {
      Yogyakarta: {
        postalCodes: ["55111", "55211", "55311"],
        kecamatan: {
          Gondokusuman: ["Demangan", "Kotabaru", "Klitren", "Baciro"],
          Umbulharjo: ["Warungboto", "Sorosutan", "Semaki", "Mantrijeron"],
          Kotagede: ["Purbayan", "Prenggan", "Jagalan", "Rejowinangun"],
        },
      },
      Sleman: {
        postalCodes: ["55511", "55581", "55584"],
        kecamatan: {
          Depok: ["Caturtunggal", "Condongcatur", "Maguwoharjo", "Caturharjo"],
          Mlati: ["Sinduadi", "Sumberadi", "Tlogoadi", "Tirtoadi"],
          Ngaglik: ["Sari Harjo", "Minomartani", "Sukoharjo", "Donoharjo"],
        },
      },
    },
  },
  "Sumatera Utara": {
    postalCodes: ["20111", "20211", "20311"],
    cities: {
      Medan: {
        postalCodes: ["20111", "20211", "20311"],
        kecamatan: {
          "Medan Kota": ["Kesawan", "Pusat Pasar", "Kampung Baru", "Sudirejo"],
          "Medan Baru": ["Babura", "Titi Rantai", "Siti Rejo I", "Anggrung"],
          "Medan Petisah": ["Petisah Tengah", "Sei Sikambing D", "Glugur Darat II", "Babura"],
        },
      },
    },
  },
  "Bali": {
    postalCodes: ["80111", "80211", "80311"],
    cities: {
      Denpasar: {
        postalCodes: ["80111", "80211", "80311"],
        kecamatan: {
          "Denpasar Selatan": ["Sesetan", "Pemogan", "Renon", "Panjer"],
          "Denpasar Timur": ["Sumerta Kaja", "Sumerta Kelod", "Kesiman Kertalangu", "Penatih"],
          "Denpasar Barat": ["Padangsambian", "Pemecutan Kaja", "Tegal Harum", "Dauh Puri"],
        },
      },
    },
  },
  "Sulawesi Selatan": {
    postalCodes: ["90111", "90211", "90311"],
    cities: {
      Makassar: {
        postalCodes: ["90111", "90211", "90311"],
        kecamatan: {
          Panakkukang: ["Masale", "Pampang", "Karampuang", "Tamamaung"],
          Tamalate: ["Tamalate", "Balang Baru", "Parang Tambung", "Mangasa"],
          Rappocini: ["Gunung Sari", "Maccini Sombala", "Karunrung", "Borong"],
        },
      },
    },
  },
  "Kalimantan Timur": {
    postalCodes: ["75111", "75211", "75311"],
    cities: {
      Samarinda: {
        postalCodes: ["75111", "75211", "75311"],
        kecamatan: {
          "Samarinda Utara": ["Sempaja Selatan", "Gunung Lingai", "Sungai Pinang Dalam", "Mugirejo"],
          "Samarinda Ilir": ["Sungai Pinang Luar", "Mugirejo", "Harapan Baru", "Loa Bakung"],
          "Samarinda Ulu": ["Sempaja Utara", "Sempaja Timur", "Sempaja Barat", "Teluk Lerong Ulu"],
        },
      },
      Balikpapan: {
        postalCodes: ["76111", "76112", "76113"],
        kecamatan: {
          "Balikpapan Kota": ["Prapatan", "Klandasan Ulu", "Klandasan Ilir", "Telaga Sari"],
          "Balikpapan Selatan": ["Gunung Bahagia", "Sepinggan", "Manggar", "Klandasan Ilir"],
          "Balikpapan Timur": ["Manggar", "Baru Ulu", "Kariangau", "Graha Indah"],
        },
      },
    },
  },
};

export const ALL_CITIES = Object.values(LOCATIONS).flatMap((province) =>
  Object.keys(province.cities),
);

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AnimationPatternService } from '../services/animation-pattern.service';

interface LearningStep {
  title: string;
  content: string;
  code?: string;
  example?: string;
  icon: string;
  tips?: string[];
  visualExample?: {
    description: string;
    before?: string;
    after?: string;
  };
}

@Component({
  selector: 'app-learning',
  templateUrl: './learning.page.html',
  styleUrls: ['./learning.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class LearningPage implements OnInit {
  currentStep: number = 0;
  learningSteps: LearningStep[] = [];
  patterns: any[] = [];

  constructor(
    private animationPatternService: AnimationPatternService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadPatterns();
    this.initializeLearningSteps();
  }

  loadPatterns() {
    const patterns = this.animationPatternService.getPatterns();
    this.patterns = patterns.map(p => ({
      id: p.id,
      name: p.name,
      jsonCode: p.jsonCode,
      animNumber: p.animNumber
    }));
  }

  initializeLearningSteps() {
    this.learningSteps = [
      {
        title: 'Selamat Datang! 🎓',
        content: 'Halo! Selamat datang di panduan pembelajaran coding untuk EDUBOX LED Matrix. Di sini kamu akan belajar bagaimana menggunakan kode JSON untuk mengontrol animasi LED. Mari kita mulai!',
        icon: 'rocket-outline',
        tips: [
          'Ikuti setiap langkah dengan teliti',
          'Jangan terburu-buru, pahami setiap konsep',
          'Coba praktikkan langsung setelah mempelajari'
        ]
      },
      {
        title: 'Apa itu JSON? 📝',
        content: 'JSON (JavaScript Object Notation) adalah format data yang mudah dibaca manusia dan mudah diproses oleh komputer. JSON menggunakan struktur key-value pairs (pasangan kunci-nilai).\n\nBayangkan JSON seperti formulir yang memiliki kolom dan isinya. Setiap "key" adalah nama kolom, dan "value" adalah isinya.',
        code: `{
  "nama": "Budi",
  "umur": 20,
  "aktif": true
}`,
        example: 'Contoh sederhana struktur JSON',
        icon: 'document-text-outline',
        tips: [
          'JSON selalu dimulai dengan { dan diakhiri dengan }',
          'Setiap field dipisahkan dengan koma (,)',
          'Nilai teks harus dalam tanda kutip ganda (")',
          'Nilai angka dan boolean tidak perlu tanda kutip'
        ],
        visualExample: {
          description: 'Struktur dasar JSON',
          before: 'Formulir biasa',
          after: 'Format JSON'
        }
      },
      {
        title: 'Struktur Kode JSON untuk Animasi 🎬',
        content: 'Untuk memainkan animasi di EDUBOX, kamu perlu menggunakan kode JSON dengan struktur khusus. Setiap animasi memiliki kode JSON unik yang harus kamu input dengan benar.\n\nKode JSON animasi memiliki 3 bagian penting:',
        code: `{
  "animation": 1,              ← Nomor animasi
  "type": "diagonal-bounce",   ← Jenis/ID animasi
  "version": "1.0"             ← Versi kode
}`,
        example: 'Format standar kode JSON untuk semua animasi',
        icon: 'code-outline',
        tips: [
          'Field "animation" adalah nomor 1-10',
          'Field "type" harus sesuai dengan ID animasi',
          'Field "version" biasanya "1.0"',
          'Semua field WAJIB ada dan harus sesuai'
        ]
      },
      {
        title: 'Memahami Setiap Field 🔍',
        content: 'Mari kita pelajari setiap field dalam kode JSON animasi secara detail:',
        code: `{
  "animation": 1,
  //   ↑
  //   Nomor animasi (1-10)
  //   Setiap animasi punya nomor unik
  
  "type": "diagonal-bounce",
  //   ↑
  //   ID animasi dalam format teks
  //   Harus sesuai dengan animasi yang dipilih
  
  "version": "1.0"
  //   ↑
  //   Versi kode JSON
  //   Saat ini menggunakan versi 1.0
}`,
        icon: 'list-outline',
        tips: [
          'animation = 1 untuk Diagonal Bounce',
          'animation = 2 untuk Box Rotate',
          'animation = 3 untuk Wave',
          'Dan seterusnya...'
        ]
      },
      {
        title: 'Cara Membaca Kode JSON 📖',
        content: 'Membaca kode JSON itu mudah! Ikuti aturan berikut:',
        code: `{
  "animation": 1,           ← Angka (integer)
  "type": "diagonal-bounce", ← Teks (string)
  "version": "1.0"          ← Teks (string)
}`,
        icon: 'book-outline',
        tips: [
          '{ } = Tanda kurung kurawal membuka dan menutup',
          '" " = Tanda kutip untuk nilai teks',
          ': = Titik dua memisahkan key dan value',
          ', = Koma memisahkan field',
          'Tidak ada koma di field terakhir!'
        ],
        visualExample: {
          description: 'Komponen dalam JSON',
          before: 'Struktur sederhana',
          after: 'Dengan penjelasan detail'
        }
      },
      {
        title: 'Praktik: Cara Menggunakan Kode 🎯',
        content: 'Sekarang mari kita praktikkan! Ikuti langkah-langkah berikut:',
        icon: 'play-circle-outline',
        tips: [
          'Langkah 1: Pilih animasi yang ingin kamu mainkan',
          'Langkah 2: Modal akan muncul - ini normal!',
          'Langkah 3: Copy kode JSON yang sesuai (lihat daftar di bawah)',
          'Langkah 4: Paste atau ketik kode JSON di textarea',
          'Langkah 5: Klik tombol "Validasi Kode JSON"',
          'Langkah 6: Jika benar, animasi akan langsung diputar!'
        ]
      },
      {
        title: 'Contoh: Diagonal Bounce 🎨',
        content: 'Mari lihat contoh lengkap untuk animasi Diagonal Bounce:',
        code: `{
  "animation": 1,
  "type": "diagonal-bounce",
  "version": "1.0"
}`,
        example: 'Kode ini digunakan saat kamu memilih animasi "Diagonal Bounce"',
        icon: 'color-palette-outline',
        tips: [
          'Nomor animation harus 1',
          'Type harus "diagonal-bounce" (huruf kecil, pakai dash)',
          'Version harus "1.0"',
          'Copy kode ini persis seperti yang tertulis!'
        ]
      },
      {
        title: 'Kesalahan Umum ❌',
        content: 'Hindari kesalahan-kesalahan berikut:',
        code: `❌ SALAH:
{
  "animation": 1,
  "type": "Diagonal Bounce"  ← Jangan pakai spasi
}

✅ BENAR:
{
  "animation": 1,
  "type": "diagonal-bounce"  ← Pakai dash (-)
}`,
        icon: 'alert-circle-outline',
        tips: [
          'Jangan gunakan spasi di field "type"',
          'Gunakan dash (-) untuk memisahkan kata',
          'Semua huruf kecil (lowercase)',
          'Jangan lupa tanda kutip untuk string',
          'Pastikan tanda kurung dan koma benar'
        ]
      },
      {
        title: 'Tips & Trik Ahli 🚀',
        content: 'Tips untuk menjadi ahli menggunakan kode JSON:',
        icon: 'bulb-outline',
        tips: [
          '✅ Selalu copy kode JSON yang tepat untuk animasi yang dipilih',
          '✅ Periksa kembali sebelum klik validasi',
          '✅ Jika error, cek tanda kutip, koma, dan kurung kurawal',
          '✅ Gunakan fitur copy di halaman ini untuk memudahkan',
          '✅ Latih dengan berbagai animasi untuk lebih paham',
          '✅ Pelajari pola - setiap animasi mengikuti format yang sama'
        ]
      }
    ];
  }

  nextStep() {
    if (this.currentStep < this.learningSteps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(index: number) {
    this.currentStep = index;
  }

  get currentStepData(): LearningStep {
    return this.learningSteps[this.currentStep];
  }

  get isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.learningSteps.length - 1;
  }

  get progress(): number {
    return ((this.currentStep + 1) / this.learningSteps.length) * 100;
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      await this.showToast('Kode berhasil disalin ke clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy:', error);
      await this.showToast('Gagal menyalin kode', 'warning');
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}

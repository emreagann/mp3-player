class Music {
  constructor(title, artist, img,file) {
    this.title = title;
    this.artist = artist;
    this.img = img;
  this.file = file;
  }

getName() {
    return this.title + " - " + this.artist;

}
}
const musicList = [
 new Music("Renklensin","Reynmen","1.jpg","1.mp3"),
 new Music("Ayayay","Bratia Stereo","2.jpg","2.mp3"),
 new Music("Hips Don't Lie","Shakira","3.jpg","3.mp3"),
 new Music("APT","Rose","4.jpeg","4.mp3"),
 new Music("Bir Ateşe Attın Beni","Kamuran Akkor","5.jpg","5.mp3"),
];

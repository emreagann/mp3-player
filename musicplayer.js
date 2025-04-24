class MusicPlayer {
    constructor(musicList){
        this.musicList = musicList;
        this.currentIndex = 0;
        
    }
    getMusic(){
        return this.musicList[this.currentIndex];
    }
    next(){
        if(this.currentIndex + 1 < this.musicList.length){
            this.currentIndex++;
        }
        else{
            this.currentIndex = 0;
        }
    }
    prev(){
        if(this.currentIndex != 0) {
            this.currentIndex--;
        } else {
            this.currentIndex = this.musicList.length - 1;
        }
    }
}
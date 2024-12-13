class PodcastPlayer {
    constructor() {
        this.episodes = [];
        this.currentEpisode = null;
        this.audioPlayer = document.getElementById('audio-player');
        this.playlist = document.getElementById('playlist');
        this.nowPlaying = document.getElementById('now-playing');
        this.init();
    }

    async init() {
        await this.loadEpisodes();
        this.renderPlaylist();
        this.setupEventListeners();
    }

    async loadEpisodes() {
        try {
            // Call our secure Netlify function
            const response = await fetch('/.netlify/functions/getEpisodes');
            if (!response.ok) throw new Error('Failed to fetch episodes');

            const files = await response.json();
            this.episodes = files
                .filter(file => file.name.endsWith('.wav'))
                .map(file => ({
                    title: file.name.replace('.wav', ''),
                    url: file.download_url,
                    date: new Date().toISOString().split('T')[0]
                }));
        } catch (error) {
            console.error('Error loading episodes:', error);
            this.episodes = [];
        }
    }

    renderPlaylist() {
        this.playlist.innerHTML = this.episodes
            .map((episode, index) => `
                <div class="episode" data-index="${index}">
                    <h3>${episode.title}</h3>
                    <p>${episode.date}</p>
                </div>
            `)
            .join('');
    }

    setupEventListeners() {
        this.playlist.addEventListener('click', (e) => {
            const episodeElement = e.target.closest('.episode');
            if (!episodeElement) return;
            
            const index = episodeElement.dataset.index;
            this.playEpisode(index);
        });
    }

    playEpisode(index) {
        const episode = this.episodes[index];
        this.currentEpisode = index;
        this.audioPlayer.src = episode.url;
        this.audioPlayer.play();
        this.nowPlaying.textContent = episode.title;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PodcastPlayer();
});

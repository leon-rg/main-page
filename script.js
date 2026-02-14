const GITHUB_USERNAME = 'leon-rg';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

const LANGUAGE_EMOJIS = {
    'JavaScript': '📜',
    'TypeScript': '🔷',
    'Python': '🐍',
    'Java': '☕',
    'C++': '⚙️',
    'C': '🔧',
    'Go': '🐹',
    'Rust': '🦀',
    'Ruby': '💎',
    'PHP': '🐘',
    'HTML': '🌐',
    'CSS': '🎨',
    'Shell': '🐚',
    'Dockerfile': '🐳',
    'default': '📦'
};

async function fetchGitHubData() {
    try {
        const [userData, reposData] = await Promise.all([
            fetch(GITHUB_API_URL),
            fetch(GITHUB_REPOS_URL + '?sort=updated&per_page=100')
        ]);

        if (!userData.ok || !reposData.ok) {
            throw new Error('Error fetching GitHub data');
        }

        const user = await userData.json();
        const repos = await reposData.json();

        return { user, repos };
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        return null;
    }
}

function getLanguageEmoji(language) {
    return LANGUAGE_EMOJIS[language] || LANGUAGE_EMOJIS['default'];
}

function updateStats(user, repos) {
    const repoCount = document.getElementById('repoCount');
    if (repoCount) {
        repoCount.textContent = user.public_repos || repos.length;
    }

    const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const starsCount = document.getElementById('starsCount');
    if (starsCount) {
        starsCount.textContent = totalStars;
    }
}

function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.opacity = '0';
    card.style.animation = 'slideIn 0.5s ease-out forwards';

    const emoji = getLanguageEmoji(repo.language);
    const title = `${emoji} ${repo.name}`;
    const description = repo.description || 'No description available';
    const language = repo.language || 'Unknown';
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const updated = new Date(repo.updated_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    let linksHTML = `<a href="${repo.html_url}" target="_blank">→ View Repository</a>`;

    if (repo.homepage) {
        linksHTML += ` | <a href="${repo.homepage}" target="_blank">→ Live Demo</a>`;
    }

    let topicsHTML = '';
    if (repo.topics && repo.topics.length > 0) {
        topicsHTML = '<div style="margin-top: 10px;">';
        repo.topics.slice(0, 3).forEach(topic => {
            topicsHTML += `<span class="project-lang" style="margin-right: 5px;">#${topic}</span>`;
        });
        topicsHTML += '</div>';
    }

    card.innerHTML = `
        <div class="project-title">${title}</div>
        <div class="project-desc">${description}</div>
        ${repo.language ? `<span class="project-lang">${language}</span>` : ''}
        ${stars > 0 ? `<span class="project-lang" style="margin-left: 5px;">⭐ ${stars}</span>` : ''}
        ${forks > 0 ? `<span class="project-lang" style="margin-left: 5px;">🔱 ${forks}</span>` : ''}
        ${topicsHTML}
        <div style="margin-top: 10px; font-size: 11px; color: var(--text-secondary);">
            Updated: ${updated}
        </div>
        <div style="margin-top: 15px;">
            ${linksHTML}
        </div>
    `;

    return card;
}

async function loadProjects() {
    const loadingMessage = document.getElementById('loadingMessage');
    const projectsGrid = document.getElementById('projectsGrid');

    try {
        const data = await fetchGitHubData();

        if (!data) {
            loadingMessage.innerHTML = '<p style="color: var(--terminal-red);">❌ Error loading repositories. Please try again later.</p>';
            return;
        }

        const { user, repos } = data;

        updateStats(user, repos);

        loadingMessage.style.display = 'none';

        const ownRepos = repos.filter(repo => !repo.fork);

        const sortedRepos = ownRepos.sort((a, b) => {
            if (b.stargazers_count !== a.stargazers_count) {
                return b.stargazers_count - a.stargazers_count;
            }
            return new Date(b.updated_at) - new Date(a.updated_at);
        });

        sortedRepos.forEach((repo, index) => {
            const card = createProjectCard(repo);
            card.style.animationDelay = `${index * 0.1}s`;
            projectsGrid.appendChild(card);
        });

        if (sortedRepos.length === 0) {
            projectsGrid.innerHTML = '<p style="color: var(--text-secondary);">No repositories found.</p>';
        }

    } catch (error) {
        console.error('Error loading projects:', error);
        loadingMessage.innerHTML = '<p style="color: var(--terminal-red);">❌ Error loading repositories. Please check console for details.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const bootOverlay = document.getElementById('bootOverlay');
    const mainContent = document.getElementById('mainContent');
    
    setTimeout(() => {
        bootOverlay.style.display = 'none';
        loadProjects();
    }, 4500);

    const skipBoot = () => {
        bootOverlay.style.animation = 'bootFadeOut 0.3s ease-out forwards';
        mainContent.style.animation = 'contentFadeIn 0.5s ease-out forwards';
        setTimeout(() => {
            bootOverlay.style.display = 'none';
            loadProjects();
        }, 300);
        
        document.removeEventListener('keydown', skipBoot);
        bootOverlay.removeEventListener('click', skipBoot);
    };
    
    document.addEventListener('keydown', skipBoot);
    bootOverlay.addEventListener('click', skipBoot);
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    setInterval(() => {
        if (Math.random() > 0.95) {
            document.body.style.transform = `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)`;
            setTimeout(() => {
                document.body.style.transform = 'translate(0, 0)';
            }, 50);
        }
    }, 3000);
    
    const terminalWindows = document.querySelectorAll('.terminal-window');
    terminalWindows.forEach(window => {
        const header = window.querySelector('.terminal-header');

        const buttons = header.querySelectorAll('.terminal-button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'scale(1.2)';
                button.style.transition = 'transform 0.2s ease';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
            });
        });
    });
    
    // Konami
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            const asciiArt = document.querySelector('.ascii-art');
            if (asciiArt) {
                asciiArt.style.animation = 'glowPulse 0.5s ease-in-out infinite, rainbow 2s linear infinite';
                setTimeout(() => {
                    asciiArt.style.animation = 'glowPulse 2s ease-in-out infinite';
                }, 5000);
            }
        }
    });
    
    console.log('%c🐧 leon-rg Terminal v2.0', 'color: #00ff41; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);');
    console.log('%cWelcome to the matrix...', 'color: #00d9ff; font-size: 14px;');
    console.log('%cNow with auto-updating GitHub repos!', 'color: #ffed4e; font-size: 12px;');
    console.log('%cInterested in the code? Check it out on GitHub: https://github.com/leon-rg', 'color: #8b949e; font-size: 12px;');
});

const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);
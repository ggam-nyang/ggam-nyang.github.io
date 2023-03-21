module.exports = {
  title: `ggam-nyang.com`,
  description: `깜냥로그`,
  language: `ko`, // `ko`, `en` => currently support versions for Korean and English
  siteUrl: `https://ggam-nyang.github.io`,
  ogImage: `/og-image.png`, // Path to your in the 'static' folder
  comments: {
    utterances: {
      repo: `ggam-nyang/ggam-nyang.github.io`, // `zoomkoding/zoomkoding-gatsby-blog`,
    },
  },
  ga: '0', // Google Analytics Tracking ID
  author: {
    name: `이재윤`,
    bio: {
      role: `백엔드 개발자`,
      description: ['함께 일하고 싶은', '능동적으로 일하는', '이로운 것을 만드는'],
      thumbnail: 'sample.png', // Path to the image in the 'asset' folder
    },
    social: {
      github: `https://github.com/ggam-nyang`,
      linkedIn: `https://www.linkedin.com/in/%EC%9E%AC%EC%9C%A4-%EC%9D%B4-b90b22242/`,
      email: `v44ads@naver.com`,
    },
  },

  // metadata for About Page
  about: {
    timestamps: [
      // =====       [Timestamp Sample and Structure]      =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!) =====
      {
        date: '',
        activity: '',
        links: {
          github: '',
          post: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================
      {
        date: '2021.07 ~ 2021.12',
        activity: 'SW 사관학교 정글 2기 수료',
        links: {
          post: 'https://swjungle.net/',
          github: '',
          demo: '',
        },
      },
      {
        date: '2022.02 ~ 2022.08',
        activity: '백엔드 개발자 근무',
        links: {
          post: 'https://togi.co/',
          github: '',
          demo: '',
        },
      },
    ],

    projects: [
      // =====        [Project Sample and Structure]        =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!)  =====
      {
        title: '',
        description: '',
        techStack: ['', ''],
        thumbnailUrl: '',
        links: {
          post: '',
          github: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================
      {
        title: '[안드로이드] 하톡시그널',
        description:
          '3:3 미팅 어플',
        techStack: ['kotlin', 'android'],
        thumbnailUrl: '',
        links: {
          post: '',
          github: 'https://github.com/on-signal/heartalk-frontend',
          demo: '',
        },
      },
    ],
  },
};

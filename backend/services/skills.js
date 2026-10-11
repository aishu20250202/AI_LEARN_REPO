/* Skill data + alias list, kept separate from matching logic so the data can
   grow (or be replaced by an AI classification layer) without touching code. */
const SKILLS = [
  { name: 'JavaScript',    aliases: ['javascript', 'js'] },
  { name: 'TypeScript',    aliases: ['typescript'] },
  { name: 'React',         aliases: ['react', 'reactjs', 'react.js'] },
  { name: 'Next.js',       aliases: ['next.js', 'nextjs'] },
  { name: 'Redux',         aliases: ['redux'] },
  { name: 'Node.js',       aliases: ['node.js', 'nodejs', 'node'] },
  { name: 'Express',       aliases: ['express', 'expressjs', 'express.js'] },
  { name: 'MongoDB',       aliases: ['mongodb', 'mongo'] },
  { name: 'PostgreSQL',    aliases: ['postgresql', 'postgres'] },
  { name: 'SQL',           aliases: ['sql'] },
  { name: 'GraphQL',       aliases: ['graphql'] },
  { name: 'Python',        aliases: ['python'] },
  { name: 'Java',          aliases: ['java'] },
  { name: 'HTML',          aliases: ['html', 'html5'] },
  { name: 'CSS',           aliases: ['css', 'css3'] },
  { name: 'Tailwind CSS',  aliases: ['tailwind', 'tailwindcss', 'tailwind css'] },
  { name: 'REST APIs',     aliases: ['rest api', 'rest apis', 'restful', 'rest'] },
  { name: 'Git',           aliases: ['git', 'github', 'gitlab'] },
  { name: 'Docker',        aliases: ['docker'] },
  { name: 'Kubernetes',    aliases: ['kubernetes', 'k8s'] },
  { name: 'AWS',           aliases: ['aws', 'amazon web services'] },
  { name: 'CI/CD',         aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous delivery'] },
  { name: 'Testing',       aliases: ['jest', 'vitest', 'unit test', 'unit tests'] },
  { name: 'Linux / Bash',  aliases: ['linux', 'bash'] },
  { name: 'Redis',         aliases: ['redis'] }
];

module.exports = { SKILLS };

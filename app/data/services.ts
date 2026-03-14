export interface ServiceCategory {
  title: string;
  description: string;
  items: ServiceItem[];
}

export interface ServiceItem {
  title: string;
  description: string;
  tags: string[];
}

export const servicesData: ServiceCategory[] = [
  {
    title: 'Experiential',
    description: 'We build to inspire, but also build to code.',
    items: [
      {
        title: 'Architecture',
        description: 'Our architects specialize in bridging imagination with reality, ensuring bold concepts meet practical standards.',
        tags: ['Creative and Design Direction', 'Moodboards', 'Stage Design', 'Retail Design', 'Floorplans', 'Structural Design', 'CAD Renders', 'High Res 3D Mocks', 'Fabrication Plans', 'Permitting & Compliance Consulting'],
      },
      {
        title: 'Spatial & Interior Design',
        description: 'A well-designed space balances openness and intimacy to draw people in and keep them engaged.',
        tags: ['Creative and Design Direction', 'Moodboards', 'Retail', 'Wayfinding and Signage Systems', 'AR/VR/XR Integration', 'Environmental Design', 'Spatial Planning', 'Lighting Planning', 'Material Curation', 'Furniture and Decor'],
      },
      {
        title: 'Interactive / Creative Technology',
        description: 'Experiences that anticipate what users want and need, paired with intuitive interfaces that support those actions.',
        tags: ['Creative and Design Direction', 'Interactive Prototyping', 'Generative Content', 'Stage Design', 'Game Design', 'AI Model Training', 'Projection Mapping', 'Reactive Environments', 'Light Programming', 'Soundscapes & Immersive Audio'],
      },
      {
        title: 'Event Production',
        description: 'We always deliver a smooth on-site experience by clearly defining roles & responsibilities.',
        tags: ['Fabrication Management', 'Staffing Management', 'Logistics / Tour Management', 'Production Books', 'Run-of-Shows', 'Call Sheets', 'Permitting', 'Brand Ambassador Training', 'F&B Management', 'DJ / Talent Management'],
      },
    ],
  },
  {
    title: 'Digital',
    description: 'A digital experience is only as good as it functions.',
    items: [
      {
        title: '3D Modelling',
        description: 'We deliver full-service 3D pipelines tailored to your project. From avatar systems to real-time content for live shows.',
        tags: ['Creative and Design Direction', 'Character Design', 'Environment Design', 'Modelling', 'Rigging', 'Texturing', 'Optimization', '3D Fashion'],
      },
      {
        title: 'Motion & Animation',
        description: 'Strong storytelling drives our work. We collaborate with world-class motion artists who understand movement.',
        tags: ['Creative and Design Direction', 'Storyboarding', 'Animatics', 'Motion Guidelines', 'Interactive Walkthroughs', 'Content Animation', 'Web Animation', '3D Animation'],
      },
      {
        title: 'User Experience / Interface',
        description: 'We don’t rely on best practices. Each project begins from scratch to create systems that are genuinely bespoke.',
        tags: ['Creative and Design Direction', 'Wireframing', 'Prototyping', 'Insights', 'Web Design', 'App Design', 'Product Design', 'Design Systems', 'Platform Design', 'VR/XR/AR'],
      },
      {
        title: 'Development',
        description: 'We work with the best technologists early and often in our process to plan and build performant tested experiences.',
        tags: ['Technical Direction', 'Front-End Development', 'WebGL', 'CMS Integration', 'E-Commerce Integration', 'QA', 'Deployment', 'Systems Integration', 'Performance Analytics'],
      },
    ],
  },
  {
    title: 'Brand',
    description: 'Brand & Campaign Strategy',
    items: [
      {
        title: 'Brand & Campaign Strategy',
        description: 'We define the essence of your brand and create strategies that resonate with your audience.',
        tags: ['Brand Identity', 'Campaign Strategy', 'Art Direction', 'Copywriting', 'Content Strategy', 'Social Media Strategy'],
      },
    ],
  },
];

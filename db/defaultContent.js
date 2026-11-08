// The starting text for the About and Services sections.
// Edit this file to set your demo text. Changes saved in the admin page override it.
module.exports = {
  about: {
    heading: 'Hi, we are Arbel Arts Studio.',
    body: 'We are a small studio that believes the best photos happen when people forget the camera is there. We shoot mostly in natural light, direct gently, and edit with a light touch so your photos still look like you.\n\nBased in Zambia, currently at Mulungushi University and happy to travel for the right story.'
  },
  // category must match a photo category exactly (or be empty for no button)
  services: [
    { title: 'Portraits', description: 'Solo, couples or family. A relaxed 1 hour session and 20 edited photos.', price: 'From K1,200', category: 'Portrait' },
    { title: 'Special Moments', description: 'Birthdays, weddings and celebrations, covered from the first laugh to the last dance.', price: 'From K3,000', category: 'Special Moments' },
    { title: 'Events', description: 'Launches, graduations and parties. Fast turnaround, highlights within 48 hours.', price: 'From K3,000', category: 'Events' },
    { title: 'Studio sessions', description: 'Clean backdrops and controlled light for portraits, fashion and products.', price: 'From K1,500', category: 'Studio' }
  ]
};

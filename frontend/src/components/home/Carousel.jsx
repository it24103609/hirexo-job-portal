import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import './Carousel.css';

const Carousel = ({ cards }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  // Determine visible cards based on screen size
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(5);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  // Auto-slide every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [cards.length]);

  // Calculate which cards to display and their positions
  const getVisibleCards = () => {
    const result = [];
    const halfVisible = Math.floor(visibleCount / 2);
    
    for (let i = 0; i < visibleCount; i++) {
      const cardIndex = (activeIndex - halfVisible + i + cards.length) % cards.length;
      result.push({
        card: cards[cardIndex],
        index: cardIndex,
        position: i - halfVisible // -2, -1, 0, 1, 2 for 5 cards
      });
    }
    
    return result;
  };

  const visibleCards = getVisibleCards();
  const centerPosition = 0;

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <div className="carousel-track">
          {visibleCards.map(({ card, index, position }) => (
            <div
              key={index}
              className={`carousel-card carousel-card-${position === centerPosition ? 'active' : 'side'}`}
              style={{
                '--position': position,
                '--visible-count': visibleCount
              }}
            >
              <span className={`division-icon division-icon-${card.tone}`}>
                <card.icon size={28} />
              </span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              {card.link ? (
                <Button as={Link} to={card.link} size="sm" className="division-explore-btn">
                  Explore <ArrowRight size={14} />
                </Button>
              ) : (
                <Button size="sm" variant="secondary" className="division-explore-btn">
                  Coming Soon
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;

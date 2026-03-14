import React, { useState } from 'react';
import './Sidebar.css'; // სტილებს ცალკე დავწერთ

const Sidebar = ({ onRoomSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  // შენი ოთახების სია
  const rooms = [
    "კაფე-ბარი", "ვიპ საუბრები", "გამოძიება", "შიფროგრამა", 
    "ვიქტორინა", "ჩამოხრჩობანა", "მაფიის ღამე", "ჯოკერი", 
    "ნარდი", "მუსიკა", "იუმორი", "ფორუმი", "ადმინისტრაცია", "დახმარება"
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleRoomClick = (room) => {
    onRoomSelect(room); // გადავცემთ არჩეულ ოთახს
    setIsOpen(false);   // ავტომატურად ვკეცავთ მენიუს
  };

  return (
    <div>
      {/* ჰამბურგერ ღილაკი მენიუს გასაღებად */}
      <button className="menu-btn" onClick={toggleMenu}>
        {isOpen ? '✖' : '☰ მენიუ'}
      </button>

      {/* თავად გვერდითა პანელი */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">კაიფმანია 😎 🔥</div>
        <ul className="room-list">
          {rooms.map((room) => (
            <li key={room} onClick={() => handleRoomClick(room)}>
              {room}
            </li>
          ))}
          <li className="exit-btn">გასვლა</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

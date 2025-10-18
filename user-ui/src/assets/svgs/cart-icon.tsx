import React from "react";

const CartIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 2C7.89543 2 7 2.89543 7 4V5H4C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H4.21716L5.78453 19.2169C5.92063 20.2386 6.78094 21 7.81141 21H16.1886C17.2191 21 18.0794 20.2386 18.2155 19.2169L19.7828 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H17V4C17 2.89543 16.1046 2 15 2H9ZM15 5H9V4H15V5ZM6.21983 7H17.7802L16.2426 19H7.75738L6.21983 7Z"
        fill="currentColor"
      />
      <circle cx="9" cy="19" r="1" fill="currentColor" />
      <circle cx="15" cy="19" r="1" fill="currentColor" />
    </svg>
  );
};

export default CartIcon;

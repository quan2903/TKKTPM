import React, { useState } from "react";
import { Menu, MenuItem, Avatar, IconButton } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";

const AvatarMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const userData = {
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "+84 123 456 789",
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    navigate("/dashboard/Profile", { state: userData });
    handleClose();
  };

  const handleLogout = () => {
    alert("Đã đăng xuất!");
    handleClose();
  };

  return (
    <div className="flex items-center space-x-2">
      <Avatar alt={userData.fullName} src="profile-image.jpg" sx={{ width: 40, height: 40 }} />
      <span className="font-medium text-gray-800">{userData.fullName}</span>
      <IconButton onClick={handleClick}>
        <ArrowDropDownIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <MenuItem onClick={handleViewProfile}>Xem thông tin tài khoản</MenuItem>
        <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
      </Menu>
    </div>
  );
};

export default AvatarMenu;
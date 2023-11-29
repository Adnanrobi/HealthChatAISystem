import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faUser, faGear } from "@fortawesome/free-solid-svg-icons";

function Nav({ onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    {
      key: "mi_services",
      name: "Services",
      icon: faStar,
      action: () => console.log("Star icon clicked"),
    },
    {
      key: "mi_portfolio",
      name: "Portfolio",
      icon: faUser,
      action: () => console.log("User icon clicked"),
    },
    {
      key: "mi_logout",
      name: "Log Out",
      icon: faGear,
      action: onLogout,
    },
  ];

  return (
    <Navbar isBordered className="bg-blue-100">
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
      </NavbarContent>

      <NavbarMenu isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
        {menuItems.map(({ key, name, action, icon }) => (
          <NavbarMenuItem key={key}>
            <Button
              className="w-full"
              color={name === "Log Out" ? "danger" : "foreground"}
              onClick={action}
              size="lg"
            >
              <FontAwesomeIcon icon={icon} /> {name}
            </Button>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>

      <NavbarContent justify="center">
        <NavbarBrand>
          {/* <FontAwesomeIcon icon={faStar} /> */}
          <p className="font-mono text-3xl font-bold">HealthChatAI</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button as={Link} color="primary" variant="solid">
            <FontAwesomeIcon icon={faUser} /> Profile
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}

export default Nav;

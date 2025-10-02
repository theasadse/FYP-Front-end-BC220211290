import React from 'react'
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth'

const { Header, Sider, Content } = Layout

const items = [
  { key: '/admin', label: 'Dashboard' },
  { key: '/admin/activities', label: 'Activities' },
  { key: '/admin/reports', label: 'Reports' },
  { key: '/admin/users', label: 'Users' },
  { key: '/admin/roles', label: 'Roles' }
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const menu = (
    <Menu>
      <Menu.Item key="logout" onClick={() => { logout(); navigate('/login') }}>
        Logout
      </Menu.Item>
    </Menu>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={(val) => setCollapsed(val)}>
        <div className="logo" style={{ color: 'white', padding: 16, textAlign: 'center' }}>
          FYP Panel
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[window.location.pathname]}
          onClick={(e) => navigate(e.key)}
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
          <div>
            <Button type="text" onClick={() => setCollapsed(!collapsed)} icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} />
          </div>
          <div>
            <Dropdown overlay={menu} trigger={["click"]}>
              <div style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} /> {user?.name} ({user?.role})
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>{children}</Content>
      </Layout>
    </Layout>
  )
}

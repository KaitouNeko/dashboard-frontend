'use client';

import Link from 'next/link';
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconRobot,
  IconSearch,
  IconSettings,
  IconDatabaseCog,
  IconPick,
  IconAffiliate,
  IconTransitionRight,
  IconFileTextAi,
  IconKey,
  IconMessageChatbot,
  IconBolt,
  IconDeviceLaptop,
  IconUser,
} from '@tabler/icons-react';

import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { FileBarChart } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import useAuthStore from '@/state/authstore';

const data = {
  user: {
    name: 'cloud-interactive',
    email: 'cloud-gary@cloud-interactive.com',
    avatar:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAA5FBMVEX////3+Pju7++fpqhbam4kPkUUMzr09PV5hIcQMzsYNz4/U1nS1daIkpQnOT4tOTw7V19HdYJOhJNRjJzf4eJKXGFreHw3S1ExQERCbHdctcxq3/566v955/924f4+XGUnQUh98P9bvdeP7v+78v+S5v6n6/9m0e5z2fVbqsB45f/U9//h8/nr+v/Ex8gjVWLF8f+0ubtaorYAAAA7OThLSknJwsCdlZMaBgDb/v8cMzlZn7J5eHhnYF5xuc5SVlfOm4WHX04cHBydr7TKhmjJjXKTucRtiZC2qqXSu7KZz9/H1NgwLrv1AAABMElEQVR4AVTMVWLDQBADUBkbZl7HzBBmZrj/hbp20e9zRhJSGIZBGsMCYDleEBMCzyWHD1CZbC5fKIqlcqVaq9dr1Uq5JBYbzVy2BXBCu9IRyt0ekfoJSe51y0JH6ahFNLuS1mvrhmlaRKaIZVuSrjia226D9/Sq6wegwvgbAYh8qdeVq00Mho7kjpAICIl/FJElRxwD4/bEB1WYzhjZBsDMpwvTr5c4UKWqAWo2nS6NeIKbTlfrfrUEit1s+6B20+nCMJOJ6T7wtxsWQGMz8SNQ4wF6B8TfMSx/sml8Py0kjtPpDrER+feU5QBgT+fL5XwKo9AmcupJCLne7tTtQYgsp5+U/ny936+nI8f8bfrpkwAIPicthyEJAV7e3l5yuCTl1NXlsEjCwYiTNCIkCQCKFFS1ilhgAwAAAABJRU5ErkJggg==',
  },
  navMain: [
    {
      title: 'System Overview',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Energy Dashboard',
      url: '/dashboard/energy-dashboard',
      icon: IconBolt,
    },
    {
      title: 'Equipment Monitoring',
      url: '/dashboard/equipment-monitoring',
      icon: IconDeviceLaptop,
    },
    {
      title: 'Workspace Chat',
      url: '/dashboard/workspace-chat',
      icon: IconMessageChatbot,
    },
    // {
    //   title: "Text-to-Speech",
    //   url: "/dashboard/text-to-speech",
    //   icon: IconFileTextAi,
    // },
    {
      title: 'LLM Usage',
      url: '/dashboard/llm-analytics',
      icon: IconChartBar,
    },
    {
      title: 'ESG永續報告',
      url: '/dashboard/reports/esg',
      icon: IconChartBar,
    },
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: IconCamera,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: IconFileDescription,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: IconFileAi,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'User Management',
      url: '/dashboard/user-management',
      icon: IconUser,
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: IconSettings,
    },
    {
      title: 'Help',
      url: '/dashboard/help',
      icon: IconHelp,
    },
    {
      title: 'Search',
      url: '/dashboard/search',
      icon: IconSearch,
    },
  ],
  documents: [
    {
      title: 'Data Management',
      url: '/dashboard/document-management',
      icon: IconDatabase,
    },
    {
      title: 'RAG Vector Manager',
      url: '/dashboard/embedding-document-manager',
      icon: IconAffiliate,
    },
  ],
  configuration: [
    {
      name: 'LLM Preference',
      url: '#',
      icon: IconPick,
    },
    {
      name: 'Transcription Model',
      url: '#',
      icon: IconTransitionRight,
    },
    {
      name: 'Embedder Preferences',
      url: '#',
      icon: IconAffiliate,
    },
    {
      name: 'Vector Database',
      url: '#',
      icon: IconDatabaseCog,
    },
    {
      name: 'API Keys',
      url: '#',
      icon: IconKey,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userInfo = useAuthStore((state) => state.userInfo);
  console.log('userInfo', userInfo);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconRobot className="!size-5" />
                <span className="text-base font-semibold">AI Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {userInfo?.permission === 1 ? (
          <NavSecondary items={data.documents} subtitle="Documents" />
        ) : null}
        {userInfo?.permission === 1 ? (
          <NavDocuments
            items={data.configuration}
            subtitle="Configuration"
          ></NavDocuments>
        ) : null}
        {/* {userInfo?.permission === 1 ? ( */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        {/* ) : null} */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

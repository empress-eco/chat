import { ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { useContext, useState } from "react"
import { ChannelMembers, ChannelMembersContext, ChannelMembersContextType } from "@/utils/channel/ChannelMembersProvider"
import { EditDescriptionButton } from "@/components/feature/channel-details/edit-channel-description/EditDescriptionButton"
import { AddMembersButton } from "@/components/feature/channel-member-details/add-members/AddMembersButton"
import { UserContext } from "@/utils/auth/UserProvider"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { Box, Button, Flex, Heading, Link, Text } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { Bookmark } from "lucide-react"
import { DateMonthYear } from "@/utils/dateConversions"

export const EmptyStateForSearch = () => {
    return (
        <Flex justify="center" align="center" className={'w-full h-screen-1/2'}>
            <Flex direction='column'>
                <Text weight="bold" align="center" size='2'>Nothing turned up</Text>
                <Text align="center" className={'w-screen-1/4'} size='1'>You may want to try using different keywords, checking for typos or adjusting your filters.</Text>
                <Flex gap='1'>
                    <Text size='1'>Not the results that you expected? File an issue on</Text>
                    <Link href="https://github.com/The-Commit-Company/Raven" target="_blank" rel="noreferrer">
                        <Text color='blue' size='1'>GitHub.</Text>
                    </Link>.
                </Flex>
            </Flex>
        </Flex>
    )
}

interface EmptyStateForChannelProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    updateMembers: () => void
}

const EmptyStateForChannel = ({ channelData, channelMembers, updateMembers }: EmptyStateForChannelProps) => {

    const { currentUser } = useContext(UserContext)
    const users = useGetUserRecords()

    return (
        <Flex direction='column' className={'py-4 px-2'} gap='2'>
            <Flex direction='column' gap='2'>
                <Flex align={'center'} gap='1'>
                    <ChannelIcon type={channelData?.type} />
                    <Heading size='4'>{channelData?.channel_name}</Heading>
                </Flex>
                <Text size='2'>{users[channelData.owner]?.full_name} created this channel on <DateMonthYear date={channelData?.creation} />. This is the very beginning of the <strong>{channelData?.channel_name}</strong> channel.</Text>
                {channelData?.channel_description && <Text size={'1'} color='gray'>{channelData?.channel_description}</Text>}
            </Flex>
            {channelData?.is_archived == 0 && channelMembers[currentUser] && <Flex gap='4' className={'z-1'}>
                <EditDescriptionButton channelData={channelData} />
                {channelData?.type !== 'Open' && <AddMembersButton channelData={channelData} updateMembers={updateMembers} channelMembers={channelMembers} />}
            </Flex>}
        </Flex>
    )
}

interface EmptyStateForDMProps {
    channelData: DMChannelListItem
}

const EmptyStateForDM = ({ channelData }: EmptyStateForDMProps) => {

    const peer = channelData.peer_user_id
    const users = useGetUserRecords()
    const [open, setOpen] = useState(false)

    const onClose = () => {
        setOpen(false)
    }

    return (
        <Box className={'py-4 px-2'}>
            {channelData?.is_direct_message == 1 &&
                <Flex direction='column' gap='2'>
                    <Flex gap='2'>
                        <UserAvatar alt={users?.[peer]?.full_name ?? peer} src={users?.[peer]?.user_image ?? ''} size='3' />
                        <Flex direction='column' gap='0'>
                            <Heading size='4'>{users?.[peer]?.full_name}</Heading>
                            <Text size='1' color='gray'>{users?.[peer]?.name}</Text>
                        </Flex>
                    </Flex>
                    {channelData?.is_self_message == 1 ?
                        <Flex direction='column' gap='0'>
                            <Text size='2'><strong>This space is all yours.</strong> Draft messages, list your to-dos, or keep links and files handy. </Text>
                            <Text size='2'>And if you ever feel like talking to yourself, don't worry, we won't judge - just remember to bring your own banter to the table.</Text>
                        </Flex>
                        :
                        <Flex gap='2' align='center'>
                            <Text size='2'>This is a Direct Message channel between you and <strong>{users?.[peer]?.full_name ?? peer}</strong>. Check out their profile to learn more about them.</Text>
                            <Button size='2' variant='ghost' className={'z-1'}>View profile</Button>
                        </Flex>
                    }
                    {/* <UserProfileDrawer isOpen={isUserProfileDetailsDrawerOpen} onClose={onUserProfileDetailsDrawerClose} user={users?.[peer]} /> */}
                </Flex>
            }
        </Box>
    )
}

export const EmptyStateForSavedMessages = () => {
    return (
        <Flex direction='column' className={'mt-75 px-4'} gap='4'>
            <Flex>
                <Bookmark size='16' />
                <Text size='2'>Your saved messages will appear here</Text>
            </Flex>
            <Flex direction='column'>
                <Text>Saved messages are a convenient way to keep track of important information or messages you want to refer back to later.</Text>
                <Flex gap='1'>
                    <Text size='2'>You can save messages by simply clicking on the bookmark icon</Text>
                    <Bookmark size='16' />
                    <Text size='2'>in message actions.</Text>
                </Flex>
            </Flex>
        </Flex>
    )
}

interface ChannelHistoryFirstMessageProps {
    channelID: string
}

export const ChannelHistoryFirstMessage = ({ channelID }: ChannelHistoryFirstMessageProps) => {

    const { channel } = useCurrentChannelData(channelID)
    const { channelMembers, mutate: updateMembers } = useContext(ChannelMembersContext) as ChannelMembersContextType

    if (channel) {
        // depending on whether channel is a DM or a channel, render the appropriate component
        if (channel.type === "dm") {
            return <EmptyStateForDM channelData={channel.channelData} />
        }
        if (updateMembers) {
            return <EmptyStateForChannel channelData={channel.channelData} channelMembers={channelMembers} updateMembers={updateMembers} />
        }
    }

    return null
}
<template>
    <div class="providers-wrapper">
        <div style="font-size: 30px; padding: 16px;">Contract Details TBA</div>
        <div class="provider-tabs">
            <b-tabs>
                <b-tab title="Transactions">
                    <TxList :paging="pages" @page-clicked="onPageClicked">
                        <b-table
                            ref="table"
                            id="assets-table"
                            stacked="md"
                            hover
                            :sort-by="'id'"
                            :items="interactions"
                            :fields="fields"
                            @row-clicked="rowClicked"
                        >
                            <template #cell(transaction_id)="data">
                                {{ data.item.interactionId | tx }}
                            </template>

                            <template #cell(block_id)="data">
                                {{ data.item.blockId | tx }}
                            </template>

                            <template #cell(block_height)="data">
                                {{ data.item.blockHeight }}
                            </template>

                            <template #cell(function)="data">
                                {{ data.item.function }}
                            </template>

                            <template #cell(status)="data">
                                {{ data.item.status }}
                            </template>

                            <template #cell(confirmingPeers)="data">
                                {{ data.item.confirmingPeers }}
                            </template>

                            <template #cell(actions)="data">
                                <i
                                    v-if="!data.item._showDetails"
                                    class="fa fa-chevron-down"
                                />
                                <i v-else class="fa fa-chevron-up" />
                            </template>

                            <template slot="row-details" slot-scope="data">
                                <json-viewer
                                    :value="data.item.input"
                                    :expand-depth="1"
                                    copyable
                                    sort
                                ></json-viewer>
                            </template>
                        </b-table>
                        <div v-if="!interactions">
                            <div
                                v-for="n in 3"
                                :key="n"
                                class="preloader text-preloader manifest-preloader"
                            ></div>
                        </div>
                    </TxList>
                </b-tab>
                <b-tab title="Code">
                    <div>Dla Pepe &hearts;</div>
                </b-tab>
            </b-tabs>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import TxList from '@/components/TxList/TxList';
import { TagsParser } from 'redstone-smartweave';
import JsonViewer from 'vue-json-viewer';

export default {
    name: 'Contract',

    data() {
        return {
            info: null,
            fields: [
                'transaction_id',
                'block_id',
                'block_height',
                'function',
                'status',
                'confirmingPeers',
                { key: 'actions', label: '' },
            ],
            interactions: null,
            currentPage: 1,
            paging: null,
        };
    },

    mounted() {
        this.getInteractions(this.currentPage);
    },

    created() {},

    components: { TxList, JsonViewer },
    computed: {
        contractId() {
            return this.$route.params.id;
        },
        pages() {
            return this.paging ? this.paging : null;
        },
    },

    methods: {
        rowClicked(record) {
            this.$set(record, '_showDetails', !record._showDetails);
        },
        async onPageClicked(pageNumber) {
            this.currentPage = pageNumber;
            this.getContracts(this.currentPage);
        },
        async getInteractions(page) {
            this.interactions = [];
            axios
                .get(
                    `https://d1o5nlqr4okus2.cloudfront.net/gateway/interactions?contractId=${this.contractId}&limit=15&page=${page}`
                )

                .then(async (fetchedInteractions) => {
                    this.paging = fetchedInteractions.data.paging;
                    fetchedInteractions.data.interactions.forEach((i) => {
                        const obj = {
                            cursor: '',
                            node: i.interaction,
                        };
                        const tagsParser = new TagsParser();

                        this.interactions.push({
                            id: i.interaction.id,
                            interactionId: i.interaction.id,
                            blockId: i.interaction.block.id,
                            blockHeight: i.interaction.block.height,
                            function: JSON.parse(
                                tagsParser.getInputTag(obj, this.contractId)
                                    .value
                            ).function,
                            status: i.status,
                            input: tagsParser.getInputTag(obj, this.contractId),
                            confirmingPeers: i.confirming_peers,
                        });
                    });
                });
        },
        styleCategory(text, numberOfCategories, index) {
            return (
                _.startCase(text) + (index < numberOfCategories - 1 ? ', ' : '')
            );
        },
    },
};
</script>

<style src="./Contract.scss" lang="scss" scoped />
<style lang="scss">
.provider-tabs > .tabs > div:first-of-type {
    height: 44px;
}

.provider-tabs {
    .nav-tabs > .nav-item {
        flex: 0 0 124px;
    }
}
</style>

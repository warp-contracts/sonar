<template>
    <div class="providers-wrapper">
        <TxList :paging="pages" @page-clicked="onPageClicked">
            <b-table
                ref="table"
                id="assets-table"
                stacked="md"
                hover
                :items="contracts"
                :fields="fields"
                @row-clicked="rowClicked"
            >
                <template #cell(contractId)="data">
                    <a
                        @click="
                            $router.push(
                                '/app/contract/' + data.item.contractId
                            )
                        "
                        target="_blank"
                    >
                        {{ data.item.contractId | tx }}
                    </a>
                </template>

                <template #cell(total)="data">
                    {{ data.item.total }}
                </template>

                <template #cell(confirmed)="data">
                    {{ data.item.confirmed }}
                </template>

                <template #cell(orphaned)="data">
                    {{ data.item.orphaned }}
                </template>

                <template #cell(lastBlockHeight)="data">
                    {{ data.item.lastInteractionHeight }}
                </template>
            </b-table>
            <div v-if="!contracts">
                <div
                    v-for="n in 3"
                    :key="n"
                    class="preloader text-preloader manifest-preloader"
                ></div>
            </div>
        </TxList>
    </div>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import TxList from '@/components/TxList/TxList';

export default {
    name: 'Contracts',

    data() {
        return {
            fields: [
                'contractId',
                'total',
                'confirmed',
                'corrupted',
                'lastInteractionHeight',
            ],
            contracts: null,
            currentPage: 1,
            paging: null,
        };
    },

    mounted() {
        this.getContracts(this.currentPage);
    },

    created() {},

    components: { TxList },
    computed: {
        pages() {
            return this.paging ? this.paging : null;
        },
    },

    methods: {
        async onPageClicked(pageNumber) {
            this.currentPage = pageNumber;
            this.getContracts(this.currentPage);
        },
        async getContracts(page) {
            this.contracts = [];
            axios
                .get(
                    `https://d1o5nlqr4okus2.cloudfront.net/gateway/contracts?limit=15&page=${page}`
                )

                .then(async (fetchedContracts) => {
                    this.paging = fetchedContracts.data.paging;
                    fetchedContracts.data.contracts.forEach((contract) => {
                        this.contracts.push({
                            id: contract.contract,
                            contractId: contract.contract,
                            total: contract.interactions,
                            confirmed: contract.confirmed,
                            corrupted: contract.corrupted,
                            lastInteractionHeight:
                                contract.last_interaction_height,
                        });
                    });
                });
        },
        rowClicked(record) {
            this.$set(record, '_showDetails', !record._showDetails);
        },
        styleCategory(text, numberOfCategories, index) {
            return (
                _.startCase(text) + (index < numberOfCategories - 1 ? ', ' : '')
            );
        },
    },
};
</script>

<style src="./Contracts.scss" lang="scss" scoped />

<style scoped>
tr > th:not(:first-of-type) {
    text-align: right;
}

tr > td:not(:first-of-type) {
    text-align: right;
}
</style>
